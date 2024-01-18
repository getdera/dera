import { Container } from '@mantine/core';
import Navbar from '../../components/navbar/navbar';
import Sidebar from '../../components/sidebar/sidebar';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
        <Sidebar />
      </div>
      <main className="md:pl-72">
        <Navbar />
        <Container fluid className="pt-5 pl-3">
          {children}
        </Container>
      </main>
    </div>
  );
};

export default DashboardLayout;
