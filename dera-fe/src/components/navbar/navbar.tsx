import { cn } from '../../lib/utils';
import classes from './navbar.module.css';
import { UserButton } from '@clerk/nextjs';

const Navbar = () => {
  return (
    <nav className={cn('flex h-12 justify-end', classes.navbar)}>
      <UserButton afterSignOutUrl="/" />
    </nav>
  );
};

export default Navbar;
