import { Container, Paper, Text } from '@mantine/core';
import ProjectView from '../../../../../../../components/projects/project-view';

const ProjectPage = async () => {
  return (
    <Container fluid className="px-6 py-6">
      <Paper withBorder className="px-6 py-6">
        <ProjectView />
      </Paper>
    </Container>
  );
};

export default ProjectPage;
