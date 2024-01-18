import { auth } from '@clerk/nextjs';
import CreateProjectForm from '../../../../../../components/projects/create-project-form';
import { Container } from '@mantine/core';
import Clerk from '@clerk/clerk-sdk-node';

const NewProjectPage = async () => {
  const authedUser = auth();
  // authedUser.organization is somehow undefined (haven't figured out the reason), so we use the following workaround.
  const activeOrg = await Clerk.organizations.getOrganization({
    organizationId: authedUser.orgId!,
  });
  return (
    <Container>
      <CreateProjectForm org={{ id: activeOrg.id, name: activeOrg.name }} />
    </Container>
  );
};

export default NewProjectPage;
