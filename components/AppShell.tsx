import CollapsibleSidebar from './CollapsibleSidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="app-shell-body">
        <CollapsibleSidebar />
        <main className="app-shell-main">{children}</main>
      </div>
    </div>
  );
}
