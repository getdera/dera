'use client';
import { contact, githubUrl } from '@/lib/constants';
import {
  Anchor,
  AspectRatio,
  Card,
  Group,
  List,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconBrandGithub,
  IconCheck,
  IconDatabaseHeart,
} from '@tabler/icons-react';
import Image from 'next/image';
import { GetStartedButton } from './get-started-button';
import { LandingHero } from './landing-hero';
import classes from './page.module.css';

const LandingPage = () => {
  return (
    <>
      <Stack gap={60}>
        <LandingHero />

        <Demo />

        <Iterate />

        <Evaluate />

        <Scalability />

        <OpenSource />

        <Pricing />

        <Questions />
      </Stack>
    </>
  );
};

function Demo() {
  return (
    <Card p={0} w="100%">
      <AspectRatio w="100%" ratio={1.78}>
        <video
          src="/landing/demo.mp4"
          preload="none"
          poster="/landing/demo-preview.png"
          controls
          width="100%"
        />
      </AspectRatio>
    </Card>
  );
}

function Iterate() {
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }}>
      <Stack h="100%" justify="center">
        <Title order={2}>Iterate on your chunking strategy rapidly</Title>
        <Text>
          A good RAG system depends on good retrievals, and good retrievals
          depend on good chunking strategies that result in quality embeddings.
          With Dera, you can
        </Text>

        <List type="ordered" icon={<IconCheck color="green" />}>
          <List.Item>Create different embedding schemas easily</List.Item>
          <List.Item>Track matching results</List.Item>
          <List.Item>View the results in the app</List.Item>
        </List>
      </Stack>

      <AspectRatio ratio={780 / 600}>
        <Card p={0} withBorder>
          <Image fill src="/landing/iterate.jpg" alt="Iterate" />
        </Card>
      </AspectRatio>
    </SimpleGrid>
  );
}

function Evaluate() {
  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Stack h="100%" justify="center">
          <Title order={2}>Visualize and evaluate</Title>

          <Text>
            Inspired by Jerry Liu's (CEO & Cofounder of LlamaIndex){' '}
            <a
              href="https://www.youtube.com/watch?v=TRjq7t2Ms5I"
              target="_blank"
            >
              talk
            </a>
            , and frustrated by our own experience when building RAG
            applications, we build this tool to help visualize and evaluate text
            and embeddings data.
          </Text>
        </Stack>

        <AspectRatio ratio={780 / 600}>
          <Card p={0} withBorder>
            <Image fill src="/landing/visualize.jpg" alt="Visualize" />
          </Card>
        </AspectRatio>
      </SimpleGrid>
    </Stack>
  );
}

function Scalability() {
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }}>
      <Stack h="100%" justify="center">
        <Title order={2}>Reduce costs while ensuring scalability</Title>

        <Text>
          Dera is built on{' '}
          <Anchor
            href="https://neon.tech/"
            target="_blank"
            c="rgb(0 229 153)"
            fw="bold"
          >
            Neon Database
          </Anchor>
          , which allows us to reduce costs while ensuring scalability for our
          users.
        </Text>
      </Stack>

      <Group justify="center">
        <IconDatabaseHeart color="rgb(0 229 153)" size={260} />
      </Group>
    </SimpleGrid>
  );
}

function OpenSource() {
  return (
    <SimpleGrid
      cols={{ base: 1, md: 2 }}
      classNames={{ root: classes.gridReverse }}
    >
      <Stack h="100%" justify="center">
        <Title order={2}>Completely open-source</Title>

        <Text>
          Dera is completely open-source and you're free to self-host. Check out
          our{' '}
          <Anchor href={githubUrl} target="_blank">
            Github
          </Anchor>{' '}
          for more information. Our cloud offering is always available if you
          prefer to save the hassle.
        </Text>
      </Stack>

      <Group justify="center">
        <IconBrandGithub color="white" size={260} />
      </Group>
    </SimpleGrid>
  );
}

function Pricing() {
  return (
    <Stack gap="lg">
      <Title ta="center" order={2} size={40} id="pricing">
        Pricing
      </Title>

      <Card withBorder>
        <Group justify="space-evenly">
          <Stack gap={0}>
            <Title order={3} ta="center">
              Free
            </Title>
            <Text size="sm" c="dimmed" ta="center" mb="sm">
              Perfect for trying out Dera
            </Text>
            <GetStartedButton />
          </Stack>

          <List icon={<IconCheck color="green" />}>
            <List.Item>1 project</List.Item>
            <List.Item>Up to 5 team members</List.Item>
            <List.Item>20 API requests every 60 seconds</List.Item>
          </List>
        </Group>
      </Card>
    </Stack>
  );
}

function Questions() {
  return (
    <Stack gap="lg">
      <Title ta="center" order={2} size={40}>
        Have questions?
      </Title>

      <Text ta="center">
        Reach out to <Anchor href={`mailto:${contact}`}>{contact}</Anchor> (a
        real human owns this inbox)
      </Text>
    </Stack>
  );
}

export default LandingPage;
