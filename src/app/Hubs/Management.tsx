import React from 'react';
import {
  PageSection,
  PageSectionVariants,
  Divider,
  TextContent,
  Title,
  Tabs,
  Tab,
  TabTitleText,
  TabTitleIcon
} from '@patternfly/react-core';
import {
  UserIcon,
  UsersIcon,
  CheckCircleIcon,
  DatabaseIcon,
  CogIcon,
  ListIcon,
  BarsIcon,
  OutlinedClockIcon,
  KeyIcon,
  PortIcon,
  WrenchIcon,
  ServerGroupIcon,
  InfrastructureIcon,
  ServiceCatalogIcon,
  DesktopIcon,
  PficonNetworkRangeIcon,
  OutlinedCommentsIcon
} from '@patternfly/react-icons';
import { Properties } from '@app/Hubs/Properties';
import { UsersList } from '@app/Hubs/Users';
import { GroupsList } from '@app/Hubs/Groups';
import { SettingsRADIUS } from '@app/Hubs/SettingsRADIUS';
import { truncate_qm } from '@app/utils/string_utils';

const mapOfSecondary = {
  0: 4,
  1: 7,
  2: null,
  3: 14
}

class Management extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>){
    super(props);

    this.state = {
      hub: this.props.hub,
      activeTabKey: 0,
      activeTabKeySecondary: 4
    };

    // Toggle currently active tab
    this.handleTabClick = (event, tabIndex) => {
      this.setState({
        activeTabKey: tabIndex,
        activeTabKeySecondary: mapOfSecondary[tabIndex]
      });
    };

    this.handleTabClickSecondary = (event, tabIndex) => {
      mapOfSecondary[this.state.activeTabKey] = tabIndex;
      this.setState({
        activeTabKeySecondary: tabIndex
      });
    };
  }

  onLoadingError(): void {
    window.location = truncate_qm(window.location.toString());
  }

  setUrlKeyParam(): void {
    const pKey = this.state.activeTabKey;
    const sKey = this.state.activeTabKeySecondary;

    const params = this.props.params;
    const current_pKey = params.get('pKey');
    const current_sKey = params.get('sKey');

    if(current_pKey == null){
      window.location = window.location.toString() + "&pKey=" + pKey.toString();
    }
    else{
      window.location = window.location.toString().replace("pKey=" + current_pKey, "pKey=" + pKey.toString());
    }

    if(sKey != null){
      if(current_sKey == null){
        window.location = window.location.toString() + "&sKey=" + sKey.toString();
      }
      else{
        window.location = window.location.toString().replace("sKey=" + current_sKey, "sKey=" + sKey.toString());
      }
    }
    else{
      window.location = window.location.toString().replace("&sKey=" + current_sKey, "");
    }
  }

  setTabFromUrl(): void {
    const params = this.props.params;
    const pKey = params.get('pKey');
    const sKey = params.get('sKey');

    if(pKey != null){
      this.setState({
        activeTabKey: Number(pKey)
      })
    }

    if(sKey != null){
      this.setState({
        activeTabKeySecondary: Number(sKey)
      })
    }
  }

  componentDidMount(): void {
    this.setTabFromUrl()
  }

  componentDidUpdate(): void {
    this.setUrlKeyParam()
  }

  render(): React.Component {
    const { hub, activeTabKey, activeTabKeySecondary } = this.state;
    return(
      <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
      <TextContent>
        <Title headingLevel="h1" size="lg">Virtual Hub &lsquo;{hub}&rsquo;</Title>
      </TextContent>
      </PageSection>
      <Divider component="div" />
      <PageSection variant={PageSectionVariants.light}>
      <Tabs isFilled activeKey={activeTabKey} onSelect={this.handleTabClick} variant='default' isBox>
        <Tab eventKey={0} title={<><TabTitleIcon><DatabaseIcon/ ></TabTitleIcon><TabTitleText>Security Database</TabTitleText></>}>
          <Tabs isFilled isSecondary activeKey={activeTabKeySecondary} onSelect={this.handleTabClickSecondary}>
          <Tab eventKey={4} title={<><TabTitleIcon><UserIcon /></TabTitleIcon> <TabTitleText>Users</TabTitleText>  </>}>
          <PageSection variant={PageSectionVariants.light}>
            <UsersList hub={hub}/>
          </PageSection>
          </Tab>
          <Tab eventKey={5} title={<><TabTitleIcon><UsersIcon /></TabTitleIcon> <TabTitleText>Groups</TabTitleText>  </>}>
          <PageSection variant={PageSectionVariants.light}>
            <GroupsList hub={hub}/>
          </PageSection>
          </Tab>
          <Tab eventKey={6} title={<><TabTitleIcon><CheckCircleIcon/ ></TabTitleIcon><TabTitleText>Access Lists</TabTitleText></>}>
          <PageSection variant={PageSectionVariants.light}>
            Test
          </PageSection>
          </Tab>
          </Tabs>
        </Tab>
        <Tab eventKey={1} title={<><TabTitleIcon><CogIcon/></TabTitleIcon><TabTitleText>Settings</TabTitleText></>}>
          <Tabs isFilled isSecondary activeKey={activeTabKeySecondary} onSelect={this.handleTabClickSecondary} variant='default'>
          <Tab eventKey={7} title={<><TabTitleIcon><WrenchIcon/></TabTitleIcon><TabTitleText>Properties</TabTitleText></>}>
          <PageSection variant={PageSectionVariants.light}>
            <Properties hub={hub}/>
          </PageSection>
          </Tab>
          <Tab eventKey={8} title={<><TabTitleIcon><ServerGroupIcon/></TabTitleIcon><TabTitleText>RADIUS</TabTitleText></>}>
          <PageSection variant={PageSectionVariants.light}>
            <SettingsRADIUS hub={hub}/>
          </PageSection>
          </Tab>
          <Tab eventKey={9} title={<><TabTitleIcon><InfrastructureIcon/></TabTitleIcon><TabTitleText>Cascade Connections</TabTitleText></>}>
          <PageSection variant={PageSectionVariants.light}>
            Test
          </PageSection>
          </Tab>
          <Tab eventKey={10} title={<><TabTitleIcon><ServiceCatalogIcon/></TabTitleIcon><TabTitleText>Extended Options</TabTitleText></>}>
          <PageSection variant={PageSectionVariants.light}>
            Test
          </PageSection>
          </Tab>
          <Tab eventKey={11} title={<><TabTitleIcon><DesktopIcon/></TabTitleIcon><TabTitleText>Admin Options</TabTitleText></>}>
          <PageSection variant={PageSectionVariants.light}>
            Test
          </PageSection>
          </Tab>
          <Tab eventKey={12} title={<><TabTitleIcon><PficonNetworkRangeIcon/></TabTitleIcon><TabTitleText>IP Access Control</TabTitleText></>}>
          <PageSection variant={PageSectionVariants.light}>
            Test
          </PageSection>
          </Tab>
          <Tab eventKey={13} title={<><TabTitleIcon><OutlinedCommentsIcon/></TabTitleIcon><TabTitleText>Connection Message</TabTitleText></>}>
          <PageSection variant={PageSectionVariants.light}>
            Test
          </PageSection>
          </Tab>
          </Tabs>
        </Tab>
        <Tab eventKey={2} title={<><TabTitleIcon><ListIcon/></TabTitleIcon><TabTitleText>Sessions</TabTitleText></>}>
        <PageSection variant={PageSectionVariants.light}>
          Test
        </PageSection>
        </Tab>
        <Tab eventKey={3} title={<><TabTitleIcon><BarsIcon/></TabTitleIcon><TabTitleText>Other</TabTitleText></>}>
          <Tabs isFilled isSecondary activeKey={activeTabKeySecondary} onSelect={this.handleTabClickSecondary} variant='default'>
          <Tab eventKey={14} title={<><TabTitleIcon><OutlinedClockIcon/></TabTitleIcon><TabTitleText>Logs</TabTitleText></>}>
          <PageSection variant={PageSectionVariants.light}>
            Test
          </PageSection>
          </Tab>
          <Tab eventKey={15} title={<><TabTitleIcon><KeyIcon/></TabTitleIcon><TabTitleText>Certificates</TabTitleText></>}>
          <PageSection variant={PageSectionVariants.light}>
            Test
          </PageSection>
          </Tab>
          <Tab eventKey={16} title={<><TabTitleIcon><PortIcon/></TabTitleIcon><TabTitleText>Secure NAT</TabTitleText></>}>
          <PageSection variant={PageSectionVariants.light}>
            Test
          </PageSection>
          </Tab>
          </Tabs>
        </Tab>
      </Tabs>
      </PageSection>
      </React.Fragment>
    );
  }
}

export { Management };
