import { currentUser } from '@clerk/nextjs/server';
import MeetingTypeList from '@/components/MeetingTypeList';

const Home = async () => {
  const user = await currentUser();

  const now = new Date();
  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const date = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
  }).format(now);

  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <div className="relative h-[240px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1629] via-[#111827] to-[#0a0a1a]">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-10 left-20 h-40 w-40 rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-8">
          <div>
            <p className="text-sm font-medium text-blue-400">{date}</p>
          </div>

          <div>
            <h1 className="text-6xl font-bold tracking-tight text-white">
              {time}
            </h1>
            <div className="mt-3 flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30">
                Welcome back,
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">
                {user?.firstName ?? 'there'}
              </p>
            </div>
            <p className="mt-1 text-xl font-semibold text-white/80">
              Start or join a meeting in seconds.
            </p>
          </div>
        </div>
      </div>

      <MeetingTypeList />
    </section>
  );
};

export default Home;