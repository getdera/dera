import { RedirectToCreateOrganization, auth } from '@clerk/nextjs';
import Clerk from '@clerk/clerk-sdk-node';
import { Button, Flex } from '@mantine/core';
import OrgProjectsList from '../../../../components/projects/org-projects-list';

const DashboardPage = async () => {
  const { userId } = auth();
  if (!userId) {
    throw new Error('No user ID found');
  }

  const userHasOrg = !!(
    await Clerk.users.getOrganizationMembershipList({
      userId,
    })
  ).length;

  if (userHasOrg) {
    return (
      <>
        <Flex
          justify="flex-start"
          align="flex-start"
          direction="row"
          wrap="wrap"
        >
          {/* FEAT: when clicked, show a drop down of orgs for user to select before proceeding. Now for simplicity, we use the user's current active org. */}
          <Button size="xs" component="a" href="/dashboard/projects/new">
            New project
          </Button>
        </Flex>
        <OrgProjectsList />
      </>
    );
  }

  return <RedirectToCreateOrganization />;
};

export default DashboardPage;
