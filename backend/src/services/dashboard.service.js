import { getDashboardCounts, getAverageRating } from "../repositories/dashboard.repository.js";
import { readLoginActivities } from "../repositories/customer-auth.repository.js";
import { readCustomerChatMessages } from "../repositories/customer-chat.repository.js";

export async function fetchDashboardSummary() {
  const counts = await getDashboardCounts();
  const averageRating = await getAverageRating();

  // Fetch chat statistics
  let totalChatThreads = 0;
  let totalChatMessages = 0;
  let unreadChatCount = 0;

  try {
    const activities = await readLoginActivities();
    totalChatThreads = activities.length;

    for (const activity of activities) {
      const messages = await readCustomerChatMessages({
        userId: activity.userId,
        email: activity.email,
        phone: activity.phone,
      });
      totalChatMessages += messages.length;
      unreadChatCount += messages.filter((msg) => msg.status !== 'read').length;
    }
  } catch (error) {
    // If chat system fails, continue with zeros
    console.error("Failed to fetch chat statistics:", error);
  }

  return {
    generatedAt: new Date().toISOString(),
    totalProducts: counts.products || 0,
    totalReviews: counts.reviews || 0,
    totalContactMessages: counts.contacts || 0,
    totalPages: counts.pages || 0,
    averageRating: averageRating || 0,
    totalChatThreads,
    totalChatMessages,
    unreadChatCount,
  };
}
