import React from 'react';
import {
  PageSection,
  PageSectionVariants,
  Divider,
  Gallery,
  GalleryItem,
  Card,
  CardTitle,
  CardBody,
  Menu,
  MenuContent,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem
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
import { ManagementSubsection } from '@app/Hubs/ManagementSubsection';

const SubsectionTitles = {
  "users": "Users",
  "groups": "Groups",
  "properties": "Properties",
  "radius": "RADIUS",
}

class Management extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      hub: this.props.hub,
      subsection: null
    };
  }

  componentDidMount(): void {
    const url = window.location.hash.replace('#','');
    const urlSplitted = url.split("/");
    if (urlSplitted.shift() === "" && urlSplitted.shift() === "hubs" && urlSplitted.shift() === this.state.hub && urlSplitted.shift() === "management"){
      if(urlSplitted.length === 1){
        this.setState({ subsection: urlSplitted[0] });
      }
    }
  }

  componentDidUpdate(prevProps, prevState): void {
    const url = window.location.hash.replace('#','');
    const urlSplitted = url.split("/");
    if (urlSplitted.shift() === "" && urlSplitted.shift() === "hubs" && urlSplitted.shift() === this.state.hub && urlSplitted.shift() === "management"){
      if(urlSplitted.length === 1){
        if(urlSplitted[0] != prevState.subsection){
          this.setState({ subsection: urlSplitted[0] });
        }
      }
      else{
        if(null != prevState.subsection){
          this.setState({ subsection: null });
        }
      }
    }
  }

  render() {
    const { hub, subsection } = this.state;

    return(
      <React.Fragment>
        { subsection === null ?
        <React.Fragment>
        <PageSection variant={PageSectionVariants.light}>
          <Breadcrumb>
            <BreadcrumbItem to="#/hubs">Hubs</BreadcrumbItem>
            <BreadcrumbItem>{hub}</BreadcrumbItem>
            <BreadcrumbItem to={"#/hubs/" + hub + "/management"} isActive>Management</BreadcrumbItem>
          </Breadcrumb>
        </PageSection>
        <Divider component="div" />
        <PageSection variant={PageSectionVariants.grey}>
          <Gallery
          hasGutter
          minWidths={{
            md: '150px',
            lg: '200px',
            xl: '250px',
            '2xl': '350px'
          }}
          >
            <GalleryItem>
              <Card isFullHeight>
                <CardTitle><DatabaseIcon /> Security Database</CardTitle>
                <CardBody>
                  <Menu isPlain>
                    <MenuContent>
                      <MenuItem itemId={0} to={window.location.href + "/users"}>
                        <UserIcon /> Users
                      </MenuItem>
                      <MenuItem itemId={1} to={window.location.href + "/groups"}>
                        <UsersIcon /> Groups
                      </MenuItem>
                      <MenuItem itemId={2} isDisabled>
                        <CheckCircleIcon /> Access Lists
                      </MenuItem>
                    </MenuContent>
                  </Menu>
                </CardBody>
              </Card>
            </GalleryItem>
            <GalleryItem>
              <Card isFullHeight>
                <CardTitle><CogIcon/> Settings</CardTitle>
                <CardBody>
                  <Menu isPlain>
                    <MenuContent>
                      <MenuItem itemId={0} to={window.location.href + "/properties"}>
                        <WrenchIcon/> Properties
                      </MenuItem>
                      <MenuItem itemId={1} to={window.location.href + "/radius"}>
                        <ServerGroupIcon/> RADIUS
                      </MenuItem>
                      <MenuItem itemId={2} isDisabled>
                        <InfrastructureIcon/> Cascade Connections
                      </MenuItem>
                      <MenuItem itemId={3}  isDisabled>
                        <ServiceCatalogIcon/> Extended Options
                      </MenuItem>
                      <MenuItem itemId={4}  isDisabled>
                        <DesktopIcon/> Admin Options
                      </MenuItem>
                      <MenuItem itemId={5}  isDisabled>
                        <PficonNetworkRangeIcon/> IP Access Control
                      </MenuItem>
                      <MenuItem itemId={5}  isDisabled>
                        <OutlinedCommentsIcon/> Connection Message
                      </MenuItem>
                    </MenuContent>
                  </Menu>
                </CardBody>
              </Card>
            </GalleryItem>
            <GalleryItem>
              <Card isFullHeight>
                <CardTitle><ListIcon/> Sessions</CardTitle>
              </Card>
            </GalleryItem>
            <GalleryItem>
              <Card isFullHeight>
                <CardTitle><BarsIcon/> Other</CardTitle>
                <CardBody>
                  <Menu isPlain>
                    <MenuContent>
                      <MenuItem itemId={0}  isDisabled>
                        <OutlinedClockIcon/> Logs
                      </MenuItem>
                      <MenuItem itemId={1}  isDisabled>
                        <KeyIcon/> Certificates
                      </MenuItem>
                      <MenuItem itemId={2}  isDisabled>
                        <PortIcon/> Secure NAT
                      </MenuItem>
                    </MenuContent>
                  </Menu>
                </CardBody>
              </Card>
            </GalleryItem>
          </Gallery>
        </PageSection>
        </React.Fragment>
        :
        <React.Fragment>
        <PageSection variant={PageSectionVariants.light}>
          <Breadcrumb>
            <BreadcrumbItem to="#/hubs">Hubs</BreadcrumbItem>
            <BreadcrumbItem>{hub}</BreadcrumbItem>
            <BreadcrumbItem to={"#/hubs/" + hub + "/management"}>Management</BreadcrumbItem>
            <BreadcrumbItem to={"#/hubs/" + hub + "/management/" + subsection} isActive>{SubsectionTitles[subsection]}</BreadcrumbItem>
          </Breadcrumb>
        </PageSection>
        <PageSection variant={PageSectionVariants.grey}>
          <ManagementSubsection hub={hub} subsection={subsection} />
        </PageSection>
        </React.Fragment>
        }
      </React.Fragment>
    );
  }
}

export { Management };

      {/* <Tabs isFilled activeKey={activeTabKey} onSelect={this.handleTabClick} variant='default' isBox>
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
      </Tabs> */}