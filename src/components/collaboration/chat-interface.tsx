'use client';

import { useState, useEffect, useRef } from "react";
import { ref, onValue, push, set, update } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import type { Channel, Message, PlatformUser, Team } from "@/lib/types";
import { chatChannels as initialChannels } from "@/lib/placeholder-data";

export function ChatInterface() {
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [displayedChannels, setDisplayedChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('public');
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<PlatformUser | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to get current user info
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setCurrentUser({ id: user.uid, ...snapshot.val() });
          }
        });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Effect to get all channels from DB and seed if necessary
  useEffect(() => {
    const channelsRef = ref(db, 'chat/channels');
    const unsubscribeChannels = onValue(channelsRef, (snapshot) => {
      const existingChannels = snapshot.val() || {};
      
      const updates: {[key: string]: any} = {};
      initialChannels.forEach(defaultChannel => {
        if (!existingChannels[defaultChannel.id]) {
          const { messages, ...channelData } = defaultChannel;
          updates[defaultChannel.id] = channelData;
        }
      });

      if (Object.keys(updates).length > 0) {
        const channelsToUpdateRef = ref(db, 'chat/channels');
        update(channelsToUpdateRef, updates);
      }
      
      const combinedChannels = {...existingChannels, ...updates};
      setAllChannels(Object.values(combinedChannels));
    });
    
    return () => unsubscribeChannels();
  }, []);

  // Effect to get all teams from DB
  useEffect(() => {
    const teamsRef = ref(db, 'teams');
    const unsubscribeTeams = onValue(teamsRef, (snapshot) => {
      if (snapshot.exists()) {
        setAllTeams(Object.values(snapshot.val()));
      }
    });
    return () => unsubscribeTeams();
  }, []);

  // Effect to calculate which channels to display
  useEffect(() => {
    let channelsToShow: Channel[] = [];

    if (!currentUser) {
      channelsToShow = allChannels.filter(c => c.id === 'public');
    } else if (currentUser.role?.toLowerCase() === 'admin') {
      channelsToShow = allChannels;
    } else {
      const myTeamIds = allTeams
        .filter(team => team.members?.some(m => m.userId === currentUser.id))
        .map(t => t.id);
      channelsToShow = allChannels.filter(c => c.id === 'public' || myTeamIds.includes(c.id));
    }
    
    setDisplayedChannels(channelsToShow);

    const isCurrentChannelVisible = channelsToShow.some(c => c.id === activeChannelId);
    if (!isCurrentChannelVisible && channelsToShow.length > 0) {
      const publicChannel = channelsToShow.find(c => c.id === 'public');
      setActiveChannelId(publicChannel ? publicChannel.id : channelsToShow[0].id);
    }
  }, [currentUser, allChannels, allTeams, activeChannelId]);


  // Fetch messages for the active channel
  useEffect(() => {
    const messagesRef = ref(db, `chat/messages/${activeChannelId}`);
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesList: Message[] = Object.keys(messagesData).map(key => ({
          id: key,
          ...messagesData[key]
        }));
        setMessages(messagesList);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribeMessages();
  }, [activeChannelId]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeChannel = allChannels.find(c => c.id === activeChannelId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChannel || !currentUser) return;

    const messageData = {
      userId: currentUser.id,
      user: currentUser.email,
      avatar: "https://placehold.co/40x40.png", // Placeholder
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const messagesRef = ref(db, `chat/messages/${activeChannelId}`);
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, messageData);

    setNewMessage("");
  };

  return (
    <Card className="h-[600px] flex flex-col bg-card/60 backdrop-blur-xl">
      <CardHeader className="border-b p-4">
        <h2 className="font-headline text-xl font-semibold">{activeChannel?.name || 'Chat'}</h2>
        <p className="text-sm text-muted-foreground">{activeChannel?.description}</p>
      </CardHeader>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 border-r p-4 hidden md:block">
            <h3 className="font-semibold text-sm mb-4 text-muted-foreground">Channels</h3>
            <ul className="space-y-2">
                {displayedChannels.map(channel => (
                    <li key={channel.id}>
                        <Button 
                          variant={channel.id === activeChannelId ? 'secondary': 'ghost'} 
                          className="w-full justify-start"
                          onClick={() => setActiveChannelId(channel.id)}
                        >
                           {channel.name}
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
        <div className="flex-1 flex flex-col">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.userId === currentUser?.id ? 'flex-row-reverse' : ''}`}>
                {msg.userId !== currentUser?.id && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.avatar} data-ai-hint="person portrait" />
                      <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                )}
                <div className={`rounded-lg p-3 max-w-xs ${msg.userId === currentUser?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {msg.userId !== currentUser?.id && <p className="font-semibold text-xs mb-1">{msg.user}</p>}
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.userId === currentUser?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'} text-right`}>{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="relative w-full">
                <Input 
                  placeholder="Type a message..." 
                  className="pr-12"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={!currentUser}
                />
                <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={!currentUser || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
