import Sidebar from "./Sidebar";

type Props = {
  children: React.ReactNode;
  email: string;
};

export default function AppShell({ children, email }: Props) {
  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar email={email} />
      <div className="flex-1 ml-56 min-h-screen">
        {children}
      </div>
    </div>
  );
}
