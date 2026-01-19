import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Loader2, DollarSign, User, ExternalLink } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import AdminLayout from "@/components/layouts/AdminLayout";
import { formatPrice } from "../../lib/utils";
import { useTranslation } from "react-i18next";

import { useLoaderData, useRevalidator } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";
import { useEffect } from "react";

export default function AdminPayouts() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { revalidate } = useRevalidator();
  const { on, off, socket } = useSocket();
  const loaderData = useLoaderData() as { requests: any } | null;

  useEffect(() => {
    if (!socket) return;

    const handlePayoutUpdate = () => {
      console.log("[AdminPayouts] Payout update received via socket, refreshing list");
      queryClient.invalidateQueries({ queryKey: ["admin-payout-requests"] });
      revalidate();
    };

    on("payoutUpdate", handlePayoutUpdate);
    return () => off("payoutUpdate", handlePayoutUpdate);
  }, [socket, on, off, queryClient, revalidate]);

  const {
    data: requestsRes,
    isLoading,
    isError,
    error: fetchError,
  } = useQuery({
    queryKey: ["admin-payout-requests"],
    queryFn: () => apiClient.getAdminPayoutRequests(),
    retry: 1,
    initialData: loaderData?.requests
  });

  const payoutMutation = useMutation({
    mutationFn: (payoutId: number) => apiClient.payoutAffiliate(payoutId),
    onSuccess: () => {
      toast({
        title: t("common:messages.success"),
        description: t("admin:payouts.messages.payoutSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["admin-payout-requests"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: t("common:messages.error"),
        description: error.message,
      });
    },
  });

  const requests = Array.isArray(requestsRes?.data) ? requestsRes.data : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">
            {t("admin:payouts.title")}
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin:payouts.pendingWithdrawals")}</CardTitle>
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
                    <TableHead className="text-start">
                      {t("admin:payouts.table.affiliate")}
                    </TableHead>
                    <TableHead className="text-start">
                      {t("admin:payouts.table.code")}
                    </TableHead>
                    <TableHead className="text-start">Account Number</TableHead>
                    <TableHead className="text-start">
                      {t("admin:payouts.table.amount")}
                    </TableHead>
                    <TableHead className="text-end">
                      {t("admin:payouts.table.action")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isError && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-red-500"
                      >
                        {t("common:messages.error")}:{" "}
                        {(fetchError as Error)?.message}
                      </TableCell>
                    </TableRow>
                  )}
                  {requests.length > 0 ? (
                    requests.map((request: any) => {
                      if (!request) return null;
                      const accountNumber =
                        request.details?.accountNumber || "N/A";
                      return (
                        <TableRow key={request.id}>
                          <TableCell className="text-start">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground text-start" />
                              <div className="flex flex-col text-start">
                                <span className="font-medium">
                                  {request.user?.name}
                                </span>
                                <span className="text-xs text-muted-foreground text-start">
                                  {request.user?.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-start">
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {request.referralCode}
                            </code>
                          </TableCell>
                          <TableCell className="text-start">
                            <span className="font-mono text-sm">
                              {accountNumber}
                            </span>
                          </TableCell>
                          <TableCell className="text-lg font-bold text-green-700 text-start">
                            {formatPrice(request.amount || 0)}
                          </TableCell>
                          <TableCell className="text-end">
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              size="sm"
                              onClick={() => {
                                const amountStr = formatPrice(
                                  request.amount || 0
                                );
                                if (
                                  confirm(
                                    t("admin:payouts.messages.confirmPayout", {
                                      amount: amountStr,
                                      name: request.user?.name,
                                    })
                                  )
                                ) {
                                  payoutMutation.mutate(request.id);
                                }
                              }}
                              disabled={payoutMutation.isPending}
                            >
                              {payoutMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <DollarSign className="h-4 w-4 mr-2" />
                              )}
                              {t("admin:payouts.actions.complete")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : !isLoading && !isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        {t("admin:payouts.messages.noRequests")}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div
          className="
    bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3 text-start
    dark:bg-blue-950/40
    dark:border-blue-900
  "
        >
          <ExternalLink
            className="
      h-5 w-5 text-blue-600 mt-0.5
      dark:text-blue-400
    "
          />

          <div className="text-sm text-blue-800 text-start dark:text-blue-200">
            <p className="font-semibold text-start dark:text-blue-100">
              {t("admin:payouts.note.title")}
            </p>
            <p className="text-start dark:text-blue-300">
              {t("admin:payouts.note.description")}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
