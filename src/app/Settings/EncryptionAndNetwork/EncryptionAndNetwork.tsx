import React from 'react';
import {
  Flex,
  FlexItem,
  PageSection,
  PageSectionVariants,
  Title,
  Bullseye,
  Spinner,
} from '@patternfly/react-core';
import { ServerEncryptionCard } from '@app/Settings/EncryptionAndNetwork/EncryptionAlgorithm';
import { ServerCertificateCard } from '@app/Settings/EncryptionAndNetwork/CertificateSettings';
import { SyslogCard } from '@app/Settings/EncryptionAndNetwork/SyslogSend';
import { KeepAliveCard } from '@app/Settings/EncryptionAndNetwork/KeepAlive';
import { AdminPasswordCard } from '@app/Settings/EncryptionAndNetwork/AdminPassword';
import { IcmpDnsCard } from '@app/Settings/EncryptionAndNetwork/VpnIcmpDns';

const EncryptionNetwork: React.FunctionComponent = () => (
  <PageSection>
  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} spaceItems={{ modifier: 'spaceItemsXl' }}>

  <Flex direction={{ default: 'column' }} flex={{ default: 'flex_1' }}>
  <FlexItem>
    <ServerEncryptionCard />
  </FlexItem>
  <FlexItem>
    <ServerCertificateCard />
  </FlexItem>
  <FlexItem>
    <SyslogCard />
  </FlexItem>
  </Flex>

  <Flex direction={{ default: 'column' }} flex={{ default: 'flex_1' }}>
  <FlexItem>
    <KeepAliveCard />
  </FlexItem>
  <FlexItem>
    <AdminPasswordCard />
  </FlexItem>
  <FlexItem>
    <IcmpDnsCard />
  </FlexItem>
  </Flex>

  </Flex>
  </PageSection>
);


export { EncryptionNetwork };
