import { getDashboardMetrics } from '@/lib/actions/admin'
import Link from 'next/link'
import { ExportButtons } from '@/components/admin/ExportButtons'

export const metadata = {
  title: 'Admin Dashboard - Recipe Keeper',
}

export default async function AdminDashboard() {
  const metrics = await getDashboardMetrics()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive metrics for Recipe Keeper App
          </p>
        </div>
        <ExportButtons />
      </div>

      {/* User Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">👥 User Metrics</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Users"
            value={metrics.users.total}
            subtitle="All registered users"
            icon="👤"
          />
          <MetricCard
            title="Active Users"
            value={metrics.users.active}
            subtitle="Last 30 days"
            icon="⚡"
          />
          <MetricCard
            title="New This Month"
            value={metrics.users.newThisMonth}
            subtitle="New signups"
            icon="📈"
          />
          <MetricCard
            title="Free Users"
            value={metrics.users.byTier.free}
            subtitle="On free plan"
            icon="🆓"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <MetricCard
            title="Monthly Subscribers"
            value={metrics.users.byTier.monthly}
            subtitle="Paying monthly"
            icon="💳"
            highlight="green"
          />
          <MetricCard
            title="Annual Subscribers"
            value={metrics.users.byTier.annual}
            subtitle="Paying annually"
            icon="💎"
            highlight="purple"
          />
          <MetricCard
            title="Promo Users"
            value={metrics.users.byTier.promo}
            subtitle="Using promo codes"
            icon="🎁"
            highlight="blue"
          />
        </div>
      </div>

      {/* Recipe Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📖 Recipe Metrics</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <MetricCard
            title="Total Recipes"
            value={metrics.recipes.total}
            subtitle="All recipes in system"
            icon="📚"
          />
          <MetricCard
            title="Created This Month"
            value={metrics.recipes.thisMonth}
            subtitle="New recipes"
            icon="✨"
          />
          <MetricCard
            title="Avg per User"
            value={metrics.recipes.averagePerUser}
            subtitle="Recipes/user"
            icon="📊"
          />
        </div>
      </div>

      {/* Cookbook Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📕 Cookbook Metrics</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <MetricCard
            title="Total Cookbooks"
            value={metrics.cookbooks.total}
            subtitle="All cookbooks"
            icon="📕"
          />
          <MetricCard
            title="Shared Cookbooks"
            value={metrics.cookbooks.shared}
            subtitle="Family cookbooks"
            icon="❤️"
          />
          <MetricCard
            title="Max Members"
            value={metrics.cookbooks.maxMembers}
            subtitle="Largest cookbook"
            icon="👨‍👩‍👧‍👦"
          />
        </div>
      </div>

      {/* Revenue Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">💰 Revenue Metrics</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title="MRR"
            value={`$${metrics.subscriptions.mrr}`}
            subtitle="Monthly Recurring Revenue"
            icon="💵"
            highlight="green"
          />
          <MetricCard
            title="ARR"
            value={`$${metrics.subscriptions.arr}`}
            subtitle="Annual Recurring Revenue"
            icon="💰"
            highlight="green"
          />
          <MetricCard
            title="ARPU"
            value={`$${metrics.subscriptions.arpu}`}
            subtitle="Avg Revenue Per User"
            icon="📈"
          />
          <MetricCard
            title="LTV"
            value={`$${metrics.subscriptions.ltv}`}
            subtitle="Customer Lifetime Value"
            icon="💎"
            highlight="purple"
          />
          <MetricCard
            title="Churn Rate"
            value={`${metrics.subscriptions.churnRate}%`}
            subtitle="Annual customer churn"
            icon="📉"
            highlight={metrics.subscriptions.churnRate > 10 ? "red" : metrics.subscriptions.churnRate > 5 ? "yellow" : undefined}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <MetricCard
            title="Active Subs"
            value={metrics.subscriptions.active}
            subtitle="Paying subscribers"
            icon="✅"
            highlight="green"
          />
          <MetricCard
            title="Canceled"
            value={metrics.subscriptions.canceled}
            subtitle="Cancelled subscriptions"
            icon="❌"
            highlight="red"
          />
        </div>
      </div>

      {/* Retention & Churn Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔄 Retention & Revenue Quality</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title="GRR"
            value={`${metrics.retention.grr}%`}
            subtitle="Gross Revenue Retention"
            icon="🛡️"
            highlight={metrics.retention.grr >= 90 ? "green" : metrics.retention.grr >= 80 ? "yellow" : "red"}
          />
          <MetricCard
            title="NRR"
            value={`${metrics.retention.nrr}%`}
            subtitle="Net Revenue Retention"
            icon="📈"
            highlight={metrics.retention.nrr >= 100 ? "green" : metrics.retention.nrr >= 90 ? "yellow" : "red"}
          />
          <MetricCard
            title="Quick Ratio"
            value={metrics.retention.quickRatio > 99 ? '∞' : metrics.retention.quickRatio}
            subtitle="Growth vs. Churn"
            icon="⚡"
            highlight={metrics.retention.quickRatio >= 4 ? "purple" : metrics.retention.quickRatio >= 2 ? "green" : metrics.retention.quickRatio >= 1 ? "yellow" : "red"}
          />
          <MetricCard
            title="New MRR"
            value={`$${metrics.retention.monthlyNewMRR}`}
            subtitle="This month"
            icon="✨"
            highlight="green"
          />
          <MetricCard
            title="Churn MRR"
            value={`$${metrics.retention.monthlyChurnMRR}`}
            subtitle="Lost this month"
            icon="📉"
            highlight="red"
          />
        </div>
      </div>

      {/* Activation Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">✨ Activation & Engagement</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <MetricCard
            title="Activation Rate"
            value={`${metrics.activation.activationRate}%`}
            subtitle="Users who created recipes"
            icon="🎯"
            highlight={metrics.activation.activationRate >= 70 ? "green" : metrics.activation.activationRate >= 50 ? "yellow" : "red"}
          />
          <MetricCard
            title="Activated Users"
            value={metrics.activation.activatedUsers}
            subtitle="Users with ≥1 recipe"
            icon="👤"
          />
          <MetricCard
            title="Inactive Users"
            value={metrics.activation.totalUsers - metrics.activation.activatedUsers}
            subtitle="Never created a recipe"
            icon="😴"
            highlight="red"
          />
        </div>
      </div>

      {/* Feature Adoption */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🚀 Feature Adoption</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title="Cookbook Users"
            value={`${metrics.featureAdoption.cookbookAdoption}%`}
            subtitle="Created cookbooks"
            icon="📚"
            highlight={metrics.featureAdoption.cookbookAdoption >= 50 ? "green" : metrics.featureAdoption.cookbookAdoption >= 30 ? "yellow" : undefined}
          />
          <MetricCard
            title="Shared Cookbooks"
            value={`${metrics.featureAdoption.sharedCookbookAdoption}%`}
            subtitle="Created family cookbooks"
            icon="❤️"
            highlight={metrics.featureAdoption.sharedCookbookAdoption >= 30 ? "green" : undefined}
          />
          <MetricCard
            title="Collaboration"
            value={`${metrics.featureAdoption.cookbookCollaboration}%`}
            subtitle="Members of shared books"
            icon="👥"
            highlight={metrics.featureAdoption.cookbookCollaboration >= 40 ? "green" : undefined}
          />
          <MetricCard
            title="Power Users"
            value={`${metrics.featureAdoption.multipleCookbookUsers}%`}
            subtitle="Multiple cookbooks"
            icon="⚡"
            highlight={metrics.featureAdoption.multipleCookbookUsers >= 25 ? "purple" : undefined}
          />
          <MetricCard
            title="Promo Usage"
            value={`${metrics.featureAdoption.promoCodeUsage}%`}
            subtitle="Using promo codes"
            icon="🎁"
            highlight="blue"
          />
        </div>
      </div>

      {/* Engagement & Stickiness */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🎮 User Engagement & Stickiness</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="DAU"
            value={metrics.engagement.dau}
            subtitle="Daily Active Users"
            icon="📅"
            highlight="blue"
          />
          <MetricCard
            title="WAU"
            value={metrics.engagement.wau}
            subtitle="Weekly Active Users"
            icon="📊"
          />
          <MetricCard
            title="MAU"
            value={metrics.engagement.mau}
            subtitle="Monthly Active Users"
            icon="📈"
            highlight="green"
          />
          <MetricCard
            title="Stickiness"
            value={`${metrics.engagement.stickiness}%`}
            subtitle="DAU/MAU Ratio"
            icon="🎯"
            highlight={metrics.engagement.stickiness >= 50 ? "purple" : metrics.engagement.stickiness >= 20 ? "green" : metrics.engagement.stickiness >= 10 ? "yellow" : "red"}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <MetricCard
            title="Avg Daily Pageviews"
            value={metrics.engagement.avgDailyPageViews}
            subtitle="Last 7 days average"
            icon="👁️"
          />
          <MetricCard
            title="Recipes Viewed/User"
            value={metrics.engagement.avgRecipesViewedPerUser}
            subtitle="Per active user (7d)"
            icon="👀"
          />
        </div>
      </div>

      {/* Cohort Retention Analysis */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Cohort Retention</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Day 1 Retention"
            value={`${metrics.cohorts.day1}%`}
            subtitle={`${metrics.cohorts.eligibleForMeasurement?.day1 || 0} users eligible`}
            icon="1️⃣"
            highlight={metrics.cohorts.day1 >= 40 ? "green" : metrics.cohorts.day1 >= 25 ? "yellow" : "red"}
          />
          <MetricCard
            title="Day 7 Retention"
            value={`${metrics.cohorts.day7}%`}
            subtitle={`${metrics.cohorts.eligibleForMeasurement?.day7 || 0} users eligible`}
            icon="7️⃣"
            highlight={metrics.cohorts.day7 >= 30 ? "green" : metrics.cohorts.day7 >= 20 ? "yellow" : "red"}
          />
          <MetricCard
            title="Day 30 Retention"
            value={`${metrics.cohorts.day30}%`}
            subtitle={`${metrics.cohorts.eligibleForMeasurement?.day30 || 0} users eligible`}
            icon="📅"
            highlight={metrics.cohorts.day30 >= 20 ? "green" : metrics.cohorts.day30 >= 10 ? "yellow" : "red"}
          />
          <MetricCard
            title="Day 90 Retention"
            value={`${metrics.cohorts.day90}%`}
            subtitle={`${metrics.cohorts.eligibleForMeasurement?.day90 || 0} users eligible`}
            icon="📆"
            highlight={metrics.cohorts.day90 >= 15 ? "green" : metrics.cohorts.day90 >= 8 ? "yellow" : "red"}
          />
        </div>
      </div>

      {/* Promo Code Summary */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🎁 Promo Codes</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <MetricCard
            title="Active Codes"
            value={metrics.promos.activeCodes}
            subtitle="Currently active"
            icon="🎟️"
          />
          <MetricCard
            title="Total Uses"
            value={metrics.promos.totalUses}
            subtitle="Active promo users"
            icon="✅"
          />
        </div>

        {metrics.promos.codes.length > 0 && (
          <div className="mt-4">
            <Link
              href="/admin/promo-codes"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all promo codes →
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/promo-codes"
            className="rounded-lg border-2 border-gray-200 p-4 hover:border-indigo-500 hover:bg-indigo-50 transition-all"
          >
            <div className="text-2xl mb-2">🎁</div>
            <div className="font-semibold text-gray-900">Manage Promo Codes</div>
            <div className="text-sm text-gray-500">Create and edit codes</div>
          </Link>

          <Link
            href="/admin/users"
            className="rounded-lg border-2 border-gray-200 p-4 hover:border-indigo-500 hover:bg-indigo-50 transition-all"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-semibold text-gray-900">View Users</div>
            <div className="text-sm text-gray-500">Browse all users</div>
          </Link>

          <Link
            href="/admin/revenue"
            className="rounded-lg border-2 border-gray-200 p-4 hover:border-indigo-500 hover:bg-indigo-50 transition-all"
          >
            <div className="text-2xl mb-2">💰</div>
            <div className="font-semibold text-gray-900">Revenue Details</div>
            <div className="text-sm text-gray-500">Detailed financials</div>
          </Link>

          <Link
            href="/usage"
            className="rounded-lg border-2 border-gray-200 p-4 hover:border-indigo-500 hover:bg-indigo-50 transition-all"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold text-gray-900">API Usage</div>
            <div className="text-sm text-gray-500">Your personal usage</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  highlight,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: string
  highlight?: 'green' | 'red' | 'blue' | 'purple' | 'yellow'
}) {
  const highlightColors = {
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    yellow: 'bg-yellow-50 border-yellow-200',
  }

  const bgClass = highlight ? highlightColors[highlight] : 'bg-white border-gray-200'

  return (
    <div className={`overflow-hidden rounded-lg border-2 ${bgClass} px-4 py-5 shadow-sm`}>
      <div className="flex items-center">
        <div className="text-3xl mr-3">{icon}</div>
        <div className="flex-1">
          <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {value}
          </dd>
          <dd className="mt-1 text-xs text-gray-500">{subtitle}</dd>
        </div>
      </div>
    </div>
  )
}
