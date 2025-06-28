'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Certification } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  status: z.enum(['Planned', 'In Progress', 'Completed']),
  progress: z.number().min(0).max(100).optional(),
  date: z.string().optional(),
});

interface CertificationFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: Omit<Certification, 'id'>, id?: string) => void;
  cert: Certification | null;
}

export function CertificationFormDialog({ isOpen, onOpenChange, onSubmit, cert }: CertificationFormDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const status = form.watch('status');

  React.useEffect(() => {
    if (isOpen) {
      if (cert) {
        form.reset({
          name: cert.name,
          status: cert.status,
          progress: cert.progress,
          date: cert.date,
        });
      } else {
        form.reset({
          name: '',
          status: 'Planned',
          progress: 0,
          date: '',
        });
      }
    }
  }, [cert, form, isOpen]);

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data, cert?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{cert ? 'Edit Certification' : 'Add Certification'}</DialogTitle>
          <DialogDescription>
            {cert ? 'Update the details of your certification.' : 'Track a new certification.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certification Name</FormLabel>
                  <FormControl><Input placeholder="e.g., CISSP" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {status === 'In Progress' && (
              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress ({field.value || 0}%)</FormLabel>
                    <FormControl>
                        <Slider 
                            defaultValue={[field.value || 0]} 
                            onValueChange={(value) => field.onChange(value[0])}
                            max={100} 
                            step={1} 
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {(status === 'Planned' || status === 'Completed') && (
                 <FormField
                 control={form.control}
                 name="date"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{status === 'Planned' ? 'Planned Date' : 'Completion Date'}</FormLabel>
                     <FormControl><Input type="date" {...field} /></FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{cert ? 'Save Changes' : 'Add'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
