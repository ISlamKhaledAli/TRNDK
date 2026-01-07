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
import { useTranslation } from "react-i18next";

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

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
    mutationFn: () => apiClient.requestPayout(),
    onSuccess: () => {
      toast({ title: t('common:messages.success'), description: t('client:affiliateDashboard.messages.payoutRequested') });
      queryClient.invalidateQueries({ queryKey: ['affiliate'] });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: t('common:messages.error'), description: error.message });
    }
  });

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
                <div className="text-2xl font-bold text-muted-foreground">${((stats.pendingEarnings || 0) / 100).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{t('client:affiliateDashboard.status.pendingDesc')}</p>
              </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">{t('client:affiliateDashboard.status.available')}</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-green-700">${((stats.approvedEarnings || 0) / 100).toFixed(2)}</div>
                <Button 
                   size="sm" 
                   className="w-full h-8" 
                   disabled={(stats.approvedEarnings || 0) < 2500 || requestPayoutMutation.isPending}
                   onClick={() => requestPayoutMutation.mutate()}
                >
                   {requestPayoutMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
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
                <div className="text-2xl font-bold text-yellow-600">${((stats.requestedEarnings || 0) / 100).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{t('client:affiliateDashboard.status.requestedDesc')}</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('client:affiliateDashboard.status.paid')}</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">${((stats.paidEarnings || 0) / 100).toFixed(2)}</div>
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
    </DashboardLayout>
  );
}
