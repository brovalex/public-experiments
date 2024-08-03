import { prisma } from '@/lib/prisma';
import { Button } from 'flowbite-react';

// export default function Home() {
//   return (
//     <main className="flex min-h-screen flex-col items-center justify-between p-24">
//       <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
//         <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
//           Get started by editing&nbsp;
//           <code className="font-mono font-bold">src/app/page.tsx</code>
//         </p>
//       </div>
//     </main>
//   );
// }

const Home = async () => {
  const expenses = await prisma.expense.findMany();

  return (
    <div className="p-4 flex flex-col gap-y-4">
      <Button>Click me</Button>
      
      <h2>Home</h2>

      <ul className="flex flex-col gap-y-2">
        {expenses.map((expense) => (
          <li key={expense.id}>{expense.priceEach}</li>
        ))}
      </ul>

    </div>
  );
};

export default Home;