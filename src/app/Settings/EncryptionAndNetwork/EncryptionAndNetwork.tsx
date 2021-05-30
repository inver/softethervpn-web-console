import React from 'react';
import {
  Flex,
  FlexItem,
  PageSection,
  Divider
} from '@patternfly/react-core';
import { ServerEncryptionCard } from '@app/Settings/EncryptionAndNetwork/EncryptionAlgorithm';
import { ServerCertificateCard } from '@app/Settings/EncryptionAndNetwork/CertificateSettings';
import { SyslogCard } from '@app/Settings/EncryptionAndNetwork/SyslogSend';
import { KeepAliveCard } from '@app/Settings/EncryptionAndNetwork/KeepAlive';
import { AdminPasswordCard } from '@app/Settings/EncryptionAndNetwork/AdminPassword';
import { IcmpDnsCard } from '@app/Settings/EncryptionAndNetwork/VpnIcmpDns';
import { isBridgeMode, userGlobal, isV4 } from '@app/index';

const EncryptionNetwork: React.FunctionComponent = () => (
  <PageSection>
  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} spaceItems={{ modifier: 'spaceItemsXl' }}>

  <Flex direction={{ default: 'column' }} flex={{ default: 'flex_1' }}>
  { userGlobal === "Hub Administrator" ?
    <div/>
    :
    <FlexItem>
      <ServerEncryptionCard />
    </FlexItem>
  }
  <FlexItem>
    <ServerCertificateCard />
  </FlexItem>
  { userGlobal === "Hub Administrator" ?
    <div/>
    :
  <FlexItem>
    <SyslogCard />
  </FlexItem>
  }
  </Flex>

  { userGlobal === "Hub Administrator" ?
    <div/>
    :
  <Flex direction={{ default: 'column' }} flex={{ default: 'flex_1' }}>
  <FlexItem>
  <Divider component="div" />
    <KeepAliveCard />
  </FlexItem>
  <FlexItem>
    <AdminPasswordCard />
  </FlexItem>
  { isBridgeMode || !isV4  ? <div/> :
    <FlexItem>
      <IcmpDnsCard />
    </FlexItem>
  }
  </Flex>
  }

  </Flex>
  </PageSection>
);


export { EncryptionNetwork };
