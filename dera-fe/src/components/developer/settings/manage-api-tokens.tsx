'use client';

import { useGetAuthToken } from '@/hooks/common';
import { useOrganization } from '@clerk/nextjs';
import { OrganizationResource } from '@clerk/types';
import {
  ActionIcon,
  Button,
  Card,
  Container,
  CopyButton,
  Drawer,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Tooltip,
  rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import {
  deleteApiToken,
  listApiTokensInOrg,
} from '../../../lib/dera-client/dera.client';
import {
  CreateSdkTokenResp,
  SdkTokenResp,
} from '../../../lib/dera-client/types/sdk-tokens';
import {
  showErrorNotification,
  showSuccessNotification,
} from '../../../lib/utils';
import CreateNewTokenForm from './create-new-token-form';

const ManageApiTokensComponent = () => {
  const { isLoaded, organization } = useOrganization();
  const [apiTokens, setApiTokens] = useState<
    (SdkTokenResp | CreateSdkTokenResp)[]
  >([]);

  const [opened, { open, close }] = useDisclosure(false);

  const { getAuthToken } = useGetAuthToken();

  const fetchOrgApiTokens = async (organization: OrganizationResource) => {
    const token = await getAuthToken();
    if (!token) {
      showErrorNotification(
        'The request was not sent because no auth token was retrieved.',
      );
      return;
    }
    const listTokensResp = await listApiTokensInOrg(token, organization.id);
    setApiTokens(listTokensResp.tokens);
  };

  const generateNewTokenDrawer = (organizationId: string) => (
    <Drawer
      opened={opened}
      onClose={close}
      title={
        <>
          Generate new token in <b>{organization?.name}</b>
        </>
      }
      position="right"
    >
      <CreateNewTokenForm
        organizationId={organizationId}
        tokenCreatedCallback={tokenCreatedCallback}
      />
    </Drawer>
  );

  const tokenCreatedCallback = (createTokenResp: CreateSdkTokenResp) => {
    setApiTokens((apiTokens) => [createTokenResp, ...apiTokens]);
    close();
  };

  const copyFunc = (valueToCopy: string) => (
    <CopyButton value={valueToCopy}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
          <ActionIcon
            color={copied ? 'teal' : 'gray'}
            variant="subtle"
            onClick={copy}
          >
            {copied ? (
              <IconCheck style={{ width: rem(16) }} />
            ) : (
              <IconCopy style={{ width: rem(16) }} />
            )}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
  );

  const openConfirmRevokeModal = (orgId: string, tokenId: string) => {
    modals.openConfirmModal({
      title: 'Revoke token',
      children: (
        <Text size="sm">
          Are you sure you want to revoke this token? You will not be able to
          use it again.
        </Text>
      ),
      labels: { confirm: 'Revoke token', cancel: 'Cancel' },
      onConfirm: () => revokeToken(orgId, tokenId),
      confirmProps: { color: 'red' },
    });
  };

  const revokeToken = async (orgId: string, tokenId: string) => {
    const token = await getAuthToken();
    if (!token) {
      showErrorNotification(
        'The request was not sent because no auth token was retrieved.',
      );
      return;
    }
    try {
      await deleteApiToken(token, orgId, tokenId);
      setApiTokens((apiTokens) => apiTokens.filter((t) => t.id !== tokenId));
      showSuccessNotification('Token revoked successfully.');
    } catch (err) {
      showErrorNotification((err as any)?.message || 'An error occurred.');
    }
  };

  useEffect(() => {
    if (isLoaded && organization) {
      fetchOrgApiTokens(organization).then();
    }
  }, [isLoaded]);

  return (
    <Container>
      <Paper withBorder className="px-6 py-6">
        {isLoaded && organization ? (
          <Stack>
            {generateNewTokenDrawer(organization.id)}
            <Text>
              Manage API Tokens for <b>{organization.name}</b>
            </Text>

            <Text size="xs">
              We don't store your <b>token secret</b>. If you lose it, you can
              generate a new token. If the token has been compromised, you can
              revoke it. You need both your token key and secret to use the
              APIs.
            </Text>

            <Group>
              <Button size="xs" onClick={open}>
                Generate new token
              </Button>
            </Group>

            {apiTokens.map((token) => (
              <Card
                key={token.id}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
              >
                <Group justify="space-between">
                  <Group>
                    <Text fw={500}>{token.name}</Text>
                    <Text size="xs" c="dimmed">
                      Created {token.createdAt.toLocaleDateString()}
                    </Text>
                  </Group>
                  <Button
                    size="xs"
                    color="red"
                    onClick={() =>
                      openConfirmRevokeModal(organization.id, token.id)
                    }
                  >
                    Revoke
                  </Button>
                </Group>
                <TextInput
                  label="Token key"
                  disabled
                  value={token.id}
                  rightSection={copyFunc(token.id)}
                />
                {(token as CreateSdkTokenResp).originalTokenValue ? (
                  <TextInput
                    label="Token secret"
                    description="This is the only time we will show you this token secret. Make sure to copy it somewhere safe."
                    disabled
                    value={(token as CreateSdkTokenResp).originalTokenValue}
                    rightSection={copyFunc(
                      (token as CreateSdkTokenResp).originalTokenValue,
                    )}
                  />
                ) : null}
              </Card>
            ))}
          </Stack>
        ) : (
          <></>
        )}
      </Paper>
    </Container>
  );
};

export default ManageApiTokensComponent;
