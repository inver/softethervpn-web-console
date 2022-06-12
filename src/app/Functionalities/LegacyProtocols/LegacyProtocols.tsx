import * as React from 'react';
import {
  PageSection,
  PageSectionVariants,
  Stack,
  StackItem,
  Text,
  TextContent,
  Title,
  Divider,
  Card,
  CardTitle,
  CardBody,
  Switch,
  Button,
  Gallery,
  GalleryItem,
  Form,
  FormGroup,
  Alert,
  Select,
  SelectVariant,
  SelectOption,
  TextInput
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";
import { isIpsecCapable, isOpenVPNSupported, isSSTPSupported } from '@app/index';
import { downloadBlob, b64toBlob } from '@app/utils/blob_utils';

function isPortsList(ports: string): boolean
{
  for(let i=0; i<ports.length; i++){
    if((ports.charCodeAt(i) < 48 && ports[i] != " " && ports[i] != ",") || ports.charCodeAt(i) > 57 ){
      return false;
    }
  }
  return true;
}

const LegacyProtocols: React.FunctionComponent = () => (
  <React.Fragment>
  <PageSection variant={PageSectionVariants.light}>
  <TextContent>
    <Title headingLevel="h1" size="lg">Legacy Protocols</Title>
    <Text component="p">
      This VPN Server is capable of establishing VPN connection through legacy VPN protocols or through clone functions as described below.
    </Text>
  </TextContent>
  </PageSection>
  <Divider component="div" />
  <PageSection>
  <Gallery hasGutter>
    {isIpsecCapable ? <LT2PGalleryItems /> : ""}
    <OpenVPNGalleryItem />
  </Gallery>
  </PageSection>
  </React.Fragment>
);


// IPSec, LT2P, ...
class LT2PGalleryItems extends React.Component {
  constructor(props){
    super(props);
    this.hubOptions = [];

    this.state = {
      ipSec: false,
      raw: false,
      defaultHub: "",
      isHubOpen: false,
      etherIP: false,
      secret: "",
    };

    this.handleSwitchComponents = (isChecked, object) => {
      const id = object.target.id;

      const param: VPN.VpnIPsecServices = new VPN.VpnIPsecServices({
        L2TP_Raw_bool: id == "raw" ? isChecked : this.state.raw,
        L2TP_IPsec_bool: id == "ipSec" ? isChecked : this.state.ipSec,
        EtherIP_IPsec_bool: id == "etherIP" ? isChecked : this.state.etherIP,
        IPsec_Secret_str: this.state.secret,
        L2TP_DefaultHub_str: this.state.defaultHub
      });

      api.SetIPsecServices(param)
      .then( () => {
        this.setState({ [id]: isChecked });
      })
      .catch(error => {
        alert(error)
      });
    };

    this.onHubToggle = isHubOpen => {
      this.setState({
        isHubOpen: isHubOpen
      });
    };

    this.onHubSelect = (event, selection, isPlaceholder) => {
      if (isPlaceholder) this.clearSelection();
      else {
        const param: VPN.VpnIPsecServices = new VPN.VpnIPsecServices({
          L2TP_Raw_bool: this.state.raw,
          L2TP_IPsec_bool: this.state.ipSec,
          EtherIP_IPsec_bool: this.state.etherIP,
          IPsec_Secret_str: this.state.secret,
          L2TP_DefaultHub_str: this.state.defaultHub
        });

        api.SetIPsecServices(param)
        .then( () => {
          this.setState({
            defaultHub: selection,
            isHubOpen: false
          });
        })
        .catch(error => {
          alert(error)
        });

      }
    };

    this.handleSecretTextInputChange = value => {
      this.setState({ secret: value })
    };

    this.handleSaveClick = () => {
      const param: VPN.VpnIPsecServices = new VPN.VpnIPsecServices({
        L2TP_Raw_bool: this.state.raw,
        L2TP_IPsec_bool: this.state.ipSec,
        EtherIP_IPsec_bool: this.state.etherIP,
        IPsec_Secret_str: this.state.secret,
        L2TP_DefaultHub_str: this.state.defaultHub
      });

      api.SetIPsecServices(param)
      .catch(error => {
        alert(error)
      });
    };

    this.redirectToDetailSettings = () => {
      window.location = window.location.toString() + "/etherip"
    };
  }

  loadHubs(){
    api.EnumHub()
    .then( response => {
      if( response.HubList.length > 0 ){
        let counter = -1;

        this.hubOptions = response.HubList.map((hub) => {
          if(counter == -1){
            this.setState({ defaultHub: hub.HubName_str })
          }
          counter++;
          return(
            <SelectOption key={counter} value={hub.HubName_str} />
          );

        });
      }
    })
    .catch( error => {
      console.log(error)
    });
  }

  loadLT2P(){
    api.GetIPsecServices()
    .then( response => {
      this.setState({
        ipSec: response.L2TP_IPsec_bool,
        raw: response.L2TP_Raw_bool,
        defaultHub: response.L2TP_DefaultHub_str,
        etherIP: response.EtherIP_IPsec_bool,
        secret: response.IPsec_Secret_str,
      })
    })
  }

  componentDidMount(){
    this.loadHubs()
    this.loadLT2P()
  }

  render(){
    const { ipSec, raw, defaultHub, isHubOpen, etherIP, secret } = this.state;

    return (
      <React.Fragment>
      <GalleryItem>
        <Card>
        <CardTitle>LT2P Server (Remote Access VPN)</CardTitle>
        <CardBody>
        <Stack hasGutter>
          <StackItem>
            VPN Connections from mobile devices such as iPhones, iPads, Android Devices, built-in VPN Clients can be accepted with these functions.
          </StackItem>
          <StackItem>
            <Form>
              <FormGroup label="L2TP over IPsec">
                <Switch id="ipSec" aria-label="IPSec is enabled" isChecked={ipSec} onChange={this.handleSwitchComponents} />
              </FormGroup>
              <FormGroup label="Unencrypted L2TP">
                <Switch id="raw" aria-label="Unencripted LT2P is enabled" isChecked={raw} onChange={this.handleSwitchComponents} />
              </FormGroup>
              <FormGroup label="Fallback Virtual Hub">
                <Select
                  variant={SelectVariant.single}
                  aria-label="Default Hub Input"
                  onToggle={this.onHubToggle}
                  onSelect={this.onHubSelect}
                  selections={defaultHub}
                  isOpen={isHubOpen}
                >
                  {this.hubOptions}
                </Select>
              </FormGroup>
            </Form>
          </StackItem>
          <StackItem>
            <Alert variant="info" isInline title="Virtual Hubs">
              Users should specify their username like {'"'}Username@Target Virtual Hub Name{'"'} to connect with the LT2P Protocol Server.
              If no Virtual Hub is specified, the above Hub will be used as target.
            </Alert>
          </StackItem>
        </Stack>
        </CardBody>
        </Card>
      </GalleryItem>
      <GalleryItem>
      <Stack hasGutter>
      <StackItem>
      <Card>
      <CardTitle>EtherIP Server (Site to site VPN)</CardTitle>
      <CardBody>
      <Stack hasGutter>
        <StackItem>
          Router products which are compatible with EtherIP / L2TPv3 over IPsec can connect to Virtual Hubs on the VPN Server and establish Layer-2 (Ethernet) Bridging.
        </StackItem>
        <StackItem>
        <Form>
        <FormGroup label="EtherIP / L2TPv3 over IPsec">
          <Switch id="etherIP" aria-label="Unencripted LT2P is enabled" isChecked={etherIP} onChange={this.handleSwitchComponents} />
        </FormGroup>
        </Form>
        </StackItem>
        <StackItem>
          <Button variant="primary" onClick={this.redirectToDetailSettings}  isDisabled={!etherIP}>Detail Settings</Button>
        </StackItem>
      </Stack>
      </CardBody>
      </Card>
      </StackItem>
      <StackItem>
        <Card>
          <CardTitle>IPsec Common Setting</CardTitle>
          <CardBody>
          <Stack hasGutter>
          <StackItem>
            <Form>
              <FormGroup label="IPsec Pre-Shared Key">
                <TextInput value={secret} type="text" onChange={this.handleSecretTextInputChange} aria-label="pre-shared secret" isDisabled={!(ipSec || raw || etherIP)}/>
              </FormGroup>
            </Form>
          </StackItem>
          <StackItem>
            <Button onClick={this.handleSaveClick} isDisabled={!(ipSec || raw || etherIP)}>Save</Button>
          </StackItem>
          <StackItem>
            IPsec Pre-Shared Key is also called {'"'}PSK{'"'} or {'"'}Secret{'"'}. It should be around eight ASCII characters and know by all VPN users.
          </StackItem>
          </Stack>
          </CardBody>
        </Card>
      </StackItem>
      </Stack>
      </GalleryItem>
      </React.Fragment>
    );
  }
}

class OpenVPNGalleryItem extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      openvpn: false,
      ports: "1194",
      sstp: false
    };

    this.handleSwitchChange = (isChecked, object) => {
      const id = object.target.id;
      const param: VPN.VpnOpenVpnSstpConfig = new VPN.VpnOpenVpnSstpConfig({
        EnableOpenVPN_bool: id === "openvpn" ? isChecked: this.state.openvpn,
        OpenVPNPortList_str: this.state.ports,
        EnableSSTP_bool: id === "sstp" ? isChecked : this.state.sstp
      });

      api.SetOpenVpnSstpConfig(param)
      .catch( error => {
        alert(error)
      })

      this.setState({ [id]: isChecked });
    };

    this.handlePortsTextInputChange = ports => {
      const valid = isPortsList(ports)
      this.setState({ ports: valid ? ports : this.state.ports })
    };

    this.handleSavePorts = () => {
      this.saveSettings()
    };

    this.downloadConfig = () => {
      api.MakeOpenVpnConfigFile()
      .then( response => {
        const blob = b64toBlob(response.Buffer_bin.toString(), "application/zip");
        downloadBlob(blob, 'OpenVPN_Sample_Config.zip');
      })
      .catch( error => {
        alert(error)
      });
    }
  }

  loadSettings(){
    api.GetOpenVpnSstpConfig()
    .then( response => {
      this.setState({
        openvpn: response.EnableOpenVPN_bool,
        ports: response.OpenVPNPortList_str,
        sstp: response.EnableSSTP_bool
      })
    })
    .catch( error => {
      alert(error)
    });
  }

  saveSettings(){
    const param: VPN.VpnOpenVpnSstpConfig = new VPN.VpnOpenVpnSstpConfig({
      EnableOpenVPN_bool: this.state.openvpn,
      OpenVPNPortList_str: this.state.ports,
      EnableSSTP_bool: this.state.sstp
    });

    api.SetOpenVpnSstpConfig(param)
    .catch( error => {
      alert(error)
    })
  }

  componentDidMount(){
    this.loadSettings()
  }

  render(){
    const { openvpn, ports, sstp } = this.state;

    return(
      <React.Fragment>
      { isOpenVPNSupported ?
        <GalleryItem>
          <Card>
          <CardTitle>OpenVPN Clone Server</CardTitle>
          <CardBody>
            <Stack hasGutter>
              <StackItem>
                This VPN Server can act as an OpenVPN server, which is a product by OpenVPN Technologies, Inc.
                <br/>
                Any OpenVPN client can connect to this server.
              </StackItem>
              <StackItem>
                <Form>
                  <FormGroup label="OpenVPN Clone Server">
                    <Switch id="openvpn" aria-label="OpenVPN clone enabled" isChecked={openvpn} onChange={this.handleSwitchChange} />
                  </FormGroup>
                  <FormGroup label="UDP Ports" helperText="Multiple ports can be specified separated by commas or spaces. TCP ports are the ones designated as listeners in the dedicated section."
                  >
                    <TextInput value={ports} type="text" onChange={this.handlePortsTextInputChange} aria-label="openvpn ports" isDisabled={!openvpn}/>
                  </FormGroup>
                </Form>
              </StackItem>
              <StackItem>
                <Button onClick={this.handleSavePorts} isDisabled={!openvpn}>Save</Button>
              </StackItem>
              <StackItem>
                Making an OpenVPN Client configuration file is a very difficult job. With this tool you can generate a proper and ready-to-use OpenVPN Client configuration file.
              </StackItem>
              <StackItem>
              <Button variant="primary" onClick={this.downloadConfig} isDisabled={!openvpn}>Generate</Button>
              </StackItem>
            </Stack>
          </CardBody>
          </Card>
        </GalleryItem>
        : ""
      }
      { isSSTPSupported ?
        <GalleryItem>
        <Card>
        <CardTitle>Microsoft SSTP VPN Clone Server</CardTitle>
        <CardBody>
          <Stack hasGutter>
            <StackItem>
              This VPN Server can act as a MS-SSTP VPN Server, which is part of Server variant of Microsoft Windows by Microsoft Corporation.
              Clients are built-in Windows operating systems.
            </StackItem>
            <StackItem>
              <Form>
              <FormGroup label="MS-SSTP VPN Clone Server">
                <Switch id="sstp" aria-label="MS-SSTP clone enabled" isChecked={sstp} onChange={this.handleSwitchChange} />
              </FormGroup>
              </Form>
            </StackItem>
            <StackItem>
            </StackItem>
          </Stack>
        </CardBody>
        </Card>
        </GalleryItem>
        :
        ""
      }

      </React.Fragment>
    );
  }
}


export { LegacyProtocols };
