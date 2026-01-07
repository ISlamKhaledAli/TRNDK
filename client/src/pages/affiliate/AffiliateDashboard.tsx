import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useToast } from "../../hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAffiliateSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2, Copy, DollarSign, Users, CheckCircle, Clock } from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { formatPrice } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { useState } from "react";

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");

  // Fetch Affiliate Data
  const { data: affiliateData, isLoading, isFetching, error } = useQuery({
    queryKey: ['affiliate'],
    queryFn: () => apiClient.getAffiliateMe(),
    retry: false
  });

  // Join Mutation
  const joinMutation = useMutation({
    mutationFn: apiClient.joinAffiliate,
    onSuccess: () => {
      toast({ title: t('common:messages.success'), description: t('client:affiliateDashboard.messages.joinSuccess') });
      queryClient.invalidateQueries({ queryKey: ['affiliate'] });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: t('common:messages.error'), description: error.message });
    }
  });

  const form = useForm({
    resolver: zodResolver(insertAffiliateSchema.omit({ userId: true, commissionRate: true, isActive: true })),
    defaultValues: {
      referralCode: user?.name?.replace(/\s/g, '').toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase()
    }
  });

  const onJoin = (data: any) => {
    joinMutation.mutate(data);
  };

  const requestPayoutMutation = useMutation({
    mutationFn: (details: any) => apiClient.requestPayout(details),
    onSuccess: () => {
      toast({ title: t('common:messages.success'), description: t('client:affiliateDashboard.messages.payoutRequested') });
      queryClient.invalidateQueries({ queryKey: ['affiliate'] });
      setIsWithdrawModalOpen(false);
      setAccountNumber("");
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: t('common:messages.error'), description: error.message });
    }
  });

  const handleWithdrawSubmit = () => {
    if (!accountNumber.trim()) {
      toast({ variant: "destructive", title: t('common:messages.error'), description: "Please enter an account number" });
      return;
    }
    requestPayoutMutation.mutate({ accountNumber });
  };

  const copyLink = () => {
    if (affiliate?.referralCode) {
      const link = `${window.location.origin}/?ref=${affiliate.referralCode}`;
      navigator.clipboard.writeText(link);
      toast({ title: t('client:affiliateDashboard.messages.copied'), description: t('client:affiliateDashboard.messages.linkCopied') });
    }
  };

  if (isLoading && !affiliateData) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Not an affiliate yet
  if (error || !affiliateData) {
    return (
      <DashboardLayout>
        <div className="container max-w-2xl py-10">
          <Card>
            <CardHeader>
              <CardTitle>{t('client:affiliateDashboard.becomeAffiliate')}</CardTitle>
              <CardDescription>{t('client:affiliateDashboard.becomeAffiliateDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onJoin)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="referralCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('client:affiliateDashboard.referralCode')}</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="bg-muted" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={joinMutation.isPending} className="w-full">
                    {joinMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {joinMutation.isPending ? t('client:affiliateDashboard.joining') : t('client:affiliateDashboard.joinProgram')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const rawData = affiliateData as any;
  const affiliate = rawData?.data || rawData;
  const stats = affiliate?.stats;

  if (!stats) {
    return (
      <DashboardLayout>
          <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t('client:affiliateDashboard.title')}</h1>
            <p className="text-muted-foreground">{t('client:affiliateDashboard.subtitle')}</p>
          </div>
          <Card className="w-full md:w-auto">
            <CardContent className="p-4 flex items-center gap-2">
                <span className="text-sm font-medium">{t('client:affiliateDashboard.referralCode')}:</span>
                <code className="bg-muted px-2 py-1 rounded">{affiliate.referralCode}</code>
                <Button size="icon" variant="ghost" onClick={copyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('client:affiliateDashboard.status.totalOrders')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">{t('client:affiliateDashboard.status.totalOrdersDesc')}</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('client:affiliateDashboard.status.pending')}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">{formatPrice(stats.pendingEarnings || 0)}</div>
                <p className="text-xs text-muted-foreground">{t('client:affiliateDashboard.status.pendingDesc')}</p>
              </CardContent>
          </Card>
          <Card className="border-green-500/20 bg-green-500/10 dark:border-green-500/30 dark:bg-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">{t('client:affiliateDashboard.status.available')}</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-500" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">{formatPrice(stats.approvedEarnings || 0)}</div>
                <Button 
                   size="sm" 
                   className="w-full h-8" 
                   disabled={(stats.approvedEarnings || 0) < 2500}
                   onClick={() => setIsWithdrawModalOpen(true)}
                >
                   {t('client:affiliateDashboard.status.withdraw')}
                </Button>
                {(stats.approvedEarnings || 0) < 2500 && (
                   <p className="text-[10px] text-muted-foreground text-center">{t('client:affiliateDashboard.status.minWithdrawal')}</p>
                )}
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('client:affiliateDashboard.status.requested')}</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{formatPrice(stats.requestedEarnings || 0)}</div>
                <p className="text-xs text-muted-foreground">{t('client:affiliateDashboard.status.requestedDesc')}</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('client:affiliateDashboard.status.paid')}</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatPrice(stats.paidEarnings || 0)}</div>
                <p className="text-xs text-muted-foreground">{t('client:affiliateDashboard.status.paidDesc')}</p>
              </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
              <CardTitle>{t('client:affiliateDashboard.status.payoutInfo')}</CardTitle>
              <CardDescription>{t('client:affiliateDashboard.status.payoutNote')}</CardDescription>
          </CardHeader>
          <CardContent>
              <p className="text-sm">{t('client:affiliateDashboard.status.commissionRate')}: <strong>{affiliate.commissionRate}%</strong></p>
              <p className="text-sm mt-2">
                {t('client:affiliateDashboard.becomeAffiliateDesc')}
              </p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Modal */}
      <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden ">
          {/* Payment Header */}
          <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Withdrawal Request</h3>
                  <p className="text-sm text-primary-foreground/80">Secure payout processing</p>
                </div>
              </div>
              <CheckCircle className="h-6 w-6 text-white/80" />
            </div>
          </div>

          {/* Payment Body */}
          <div className="px-6 py-6 space-y-6">
            {/* Amount Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Available Balance</span>
                <span className="font-medium">{formatPrice(stats.approvedEarnings || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="font-medium text-primary">$0.00</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Withdrawal</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(stats.approvedEarnings || 0)}
                </span>
              </div>
            </div>

            {/* Account Details Section */}
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Payment Details</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Account Number <span className="text-destructive">*</span>
                </label>
                <Input 
                  placeholder="Enter your account number" 
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  disabled={requestPayoutMutation.isPending}
                  className="h-11 font-mono"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Your information is encrypted and secure
                </p>
              </div>
            </div>

            {/* Processing Timeline */}
            <div className="flex items-start gap-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Processing Time</p>
                <p className="text-blue-700 dark:text-blue-300">Funds will be transferred within 3-5 business days</p>
              </div>
            </div>
          </div>

          {/* Payment Footer */}
          <div className="border-t bg-muted/30 px-6 py-4">
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsWithdrawModalOpen(false)}
                disabled={requestPayoutMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleWithdrawSubmit}
                disabled={requestPayoutMutation.isPending || !accountNumber.trim()}
                className="w-full sm:flex-1 h-11 text-base font-semibold"
              >
                {requestPayoutMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Withdrawal
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-3">
              By confirming, you agree to our withdrawal terms and conditions
            </p>
          </div>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
