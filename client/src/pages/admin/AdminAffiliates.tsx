import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../hooks/use-toast";
import AdminLayout from "@/components/layouts/AdminLayout";
import { formatPrice } from "../../lib/utils";
import { useTranslation } from "react-i18next";

import { useLoaderData } from "react-router-dom";

export default function AdminAffiliates() {
  const { t } = useTranslation();
  const loaderData = useLoaderData() as { affiliates: any } | null;
  
  const { data: affiliatesRes, isLoading } = useQuery({
    queryKey: ['admin-affiliates'],
    queryFn: apiClient.getAdminAffiliates,
    retry: false,
    initialData: loaderData?.affiliates
  });

  // Ensure data structure is correct
  const affiliates = Array.isArray(affiliatesRes?.data) ? affiliatesRes.data : [];
  
  return (
    <AdminLayout>
     <div className="space-y-6">
       <h2 className="text-3xl font-bold tracking-tight">{t('admin:affiliates.title')}</h2>
       <Card>
         <CardHeader className="text-start">
            <CardTitle>{t('admin:affiliates.allAffiliates')}</CardTitle>
         </CardHeader>
         <CardContent>
            {isLoading ? (
               <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
            ) : (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="text-start">{t('admin:affiliates.table.user')}</TableHead>
                     <TableHead className="text-start">{t('admin:affiliates.table.rate')}</TableHead>
                     <TableHead className="text-start">{t('admin:affiliates.table.pending')}</TableHead>
                     <TableHead className="text-start">{t('admin:affiliates.table.approved')}</TableHead>
                     <TableHead className="text-start">{t('admin:affiliates.table.paid')}</TableHead>
                     <TableHead className="text-end">{t('admin:common.actions')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {affiliates.length > 0 ? (
                      affiliates.map((affiliate: any) => (
                         <AffiliateRow key={affiliate.id} affiliate={affiliate} />
                      ))
                   ) : (
                      <TableRow>
                         <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            {t('admin:affiliates.messages.noAffiliates')}
                         </TableCell>
                      </TableRow>
                   )}
                 </TableBody>
               </Table>
            )}
         </CardContent>
       </Card>
     </div>
    </AdminLayout>
  );
}

function AffiliateRow({ affiliate }: { affiliate: any }) {
   const { t } = useTranslation();
   const [isOpen, setIsOpen] = useState(false);
   const [rate, setRate] = useState(affiliate.commissionRate);
   const queryClient = useQueryClient();
   const { toast } = useToast();

   const updateMutation = useMutation({
      mutationFn: (updates: any) => apiClient.updateAffiliate(affiliate.id, updates),
      onSuccess: () => {
         toast({ title: t('common:messages.success'), description: t('admin:affiliates.messages.updateSuccess') });
         queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] });
         setIsOpen(false);
      },
      onError: (error: Error) => {
         toast({ variant: "destructive", title: t('common:messages.error'), description: error.message });
      }
   });

   const handleSave = () => {
      const newRate = parseFloat(rate);
      if (isNaN(newRate) || newRate < 0 || newRate > 100) {
         toast({ variant: "destructive", title: t('common:messages.error'), description: t('admin:affiliates.messages.invalidRate') });
         return;
      }
      updateMutation.mutate({ commissionRate: newRate });
   };


   return (
      <TableRow>
         <TableCell className="text-start">
            <div className="flex flex-col gap-2">
               <span className="font-medium">{affiliate.user?.name || "Unknown"}</span>
               <span className="text-xs text-muted-foreground text-start">{affiliate.user?.email}</span>
            </div>
         </TableCell>
         <TableCell className="text-start">{affiliate.commissionRate}%</TableCell>
         <TableCell className="text-yellow-600 font-medium text-start">{formatPrice(affiliate.stats?.pendingEarnings || 0)}</TableCell>
         <TableCell className="text-green-600 font-medium text-start">{formatPrice(affiliate.stats?.approvedEarnings || 0)}</TableCell>
         <TableCell className="text-blue-600 font-medium text-start">{formatPrice(affiliate.stats?.paidEarnings || 0)}</TableCell>
         <TableCell className="text-end space-x-2">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
               <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">{t('admin:affiliates.actions.modifyRate')}</Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                     <DialogTitle>{t('admin:affiliates.editRate.title')}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="rate" className="text-right">{t('admin:affiliates.editRate.rateLabel')}</Label>
                        <Input 
                           id="rate" 
                           type="number" 
                           min="0"
                           max="100"
                           step="0.1"
                           value={rate} 
                           onChange={(e) => setRate(e.target.value)} 
                           className="col-span-3"
                        />
                     </div>
                  </div>
                  <DialogFooter>
                     <Button variant="outline" onClick={() => setIsOpen(false)}>{t('admin:common.cancel')}</Button>
                     <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('admin:common.save')}
                     </Button>
                  </DialogFooter>
               </DialogContent>
            </Dialog>
         </TableCell>
      </TableRow>
   );
}
