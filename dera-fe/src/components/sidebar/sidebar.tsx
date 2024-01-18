'use client';
import { Text, Group } from '@mantine/core';
import classes from './sidebar.module.css';
import { cn } from '../../lib/utils';
import Link from 'next/link';
import { OrganizationSwitcher } from '@clerk/nextjs';

const Sidebar = () => {
  return (
    <nav className={classes.sidebar}>
      <div className={cn('h-12', classes.section)}></div>

      <div className={classes.section}>
        <Group className={classes.collectionsHeader} justify="space-between">
          <Text size="xs" fw={500} c="dimmed">
            Organizations
          </Text>
        </Group>
        <div className={cn('pt-2 pb-2', classes.collectionsHeader)}>
          <OrganizationSwitcher hidePersonal={true} />
        </div>
      </div>

      <div className={classes.section}>
        <Group className={classes.collectionsHeader} justify="space-between">
          <Text size="xs" fw={500} c="dimmed">
            Projects
          </Text>
        </Group>
        <div className={classes.collections}>
          <Link href="/dashboard" className={classes.collectionLink}>
            All projects
          </Link>
        </div>
      </div>

      <div className={classes.section}>
        <Group className={classes.collectionsHeader} justify="space-between">
          <Text size="xs" fw={500} c="dimmed">
            Organization
          </Text>
        </Group>
        <div className={classes.collections}>
          <Link href="/developer/settings" className={classes.collectionLink}>
            Developer settings
          </Link>
        </div>
      </div>

      {/* Hide section because they are not ready yet */}
      {/* <div className={classes.section}>
        <Group className={classes.collectionsHeader} justify="space-between">
          <Text size="xs" fw={500} c="dimmed">
            Documentation
          </Text>
        </Group>
        <div className={classes.collections}>
          <Link
            href="/docs/api"
            className={classes.collectionLink}
            target="_blank"
          >
            API references
          </Link>
        </div>
      </div> */}
    </nav>
  );
};

export default Sidebar;
