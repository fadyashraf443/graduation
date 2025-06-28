'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { PlatformUser, Team } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

const teamSchema = z.object({
  name: z.enum(['Red Team', 'Blue Team', 'Purple Team']),
  description: z.string().min(1, 'Description is required'),
  memberIds: z.array(z.string()).default([]),
});

interface TeamFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: z.infer<typeof teamSchema>, id?: string) => void;
  team: Team | null;
  allUsers: PlatformUser[];
}

export function TeamFormDialog({ isOpen, onOpenChange, onSubmit, team, allUsers }: TeamFormDialogProps) {
  const form = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
        name: 'Blue Team',
        description: '',
        memberIds: [],
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      if (team) {
        form.reset({
          name: team.name,
          description: team.description,
          memberIds: (team.members || []).map(m => m.userId),
        });
      } else {
        form.reset({
          name: 'Blue Team',
          description: '',
          memberIds: [],
        });
      }
    }
  }, [team, form, isOpen]);

  const handleFormSubmit = (data: z.infer<typeof teamSchema>) => {
    onSubmit(data, team?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{team ? 'Edit Team' : 'Add New Team'}</DialogTitle>
          <DialogDescription>
            {team ? 'Update the details of the team.' : 'Fill in the details for the new team.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!team}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team name" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Red Team">Red Team</SelectItem>
                      <SelectItem value="Blue Team">Blue Team</SelectItem>
                      <SelectItem value="Purple Team">Purple Team</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the team's purpose..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="memberIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Members</FormLabel>
                    <FormDescription>Select the users to add to this team.</FormDescription>
                  </div>
                  <ScrollArea className="h-40 w-full rounded-md border p-4">
                  {allUsers.map((user) => (
                    <FormField
                      key={user.id}
                      control={form.control}
                      name="memberIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={user.id}
                            className="flex flex-row items-start space-x-3 space-y-0 mb-3"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(user.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), user.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== user.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {user.email}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{team ? 'Save Changes' : 'Create Team'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
