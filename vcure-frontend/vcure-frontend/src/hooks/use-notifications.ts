import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification-service";
import type { NotificationItem } from "@/types/notifications";

const NOTIFICATIONS_QUERY_KEY = ["notifications"];

// Matches the documented useNotifications() hook (Development_Layer.docx
// §32 hooks list).
export function useNotifications() {
  return useQuery({ queryKey: NOTIFICATIONS_QUERY_KEY, queryFn: notificationService.getNotifications });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<NotificationItem[]>(NOTIFICATIONS_QUERY_KEY);
      queryClient.setQueryData<NotificationItem[]>(NOTIFICATIONS_QUERY_KEY, (current) =>
        current?.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      return { previous };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
  });
}

// No bulk "mark all read" endpoint is documented (only API 60, per-id), so
// this calls the same per-notification endpoint for every unread item
// rather than inventing a new bulk endpoint.
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (unreadIds: string[]) => {
      await Promise.all(unreadIds.map((id) => notificationService.markAsRead(id)));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => notificationService.deleteNotification(notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
  });
}
