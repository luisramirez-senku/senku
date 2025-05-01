import Metrics from '../components/Metrics';
import ChartPlaceholder from '../components/ChartPlaceholder';
import RecentActivity from '../components/RecentActivity';

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <Metrics />
      <ChartPlaceholder />
      <RecentActivity />
    </div>
  );
}
