import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { HashRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes, routes, IAppRouteGroup, AppRouteConfig } from '@app/routes';
import '@app/app.css';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import { BackgroundImage } from '@patternfly/react-core';

export let userGlobal = 'Unknown';
export let ddnsHostnameGlobal = '';
export let ddnsProxy: boolean;
export let azureGlobal: boolean;
export let capsListGlobal = [];
export let isTapSupported: boolean;
export let isBridgeMode: boolean;
export let isV4: boolean;
export let isIpsecCapable: boolean;
export let isOpenVPNSupported: boolean;
export let isSSTPSupported: boolean;

function deleteLabel(label: string) {
  routes.forEach((route) => {
    if (isIAppRouteGroup(route)) {
      route.routes.forEach((subroute) => {
        if (subroute.label == label) {
          delete subroute['label'];
        }
      });
    }
  });
}

class LoadingPageBackground extends React.Component {
  constructor(props) {
    super(props);
    /**
     * Note: When using background-filter.svg, you must also include #image_overlay as the fragment identifier
     */
    this.images = {
      xl: '/images/pfbg_2000.jpg',
      lg2x: '/images/pfbg_992@2x.jpg',
      sm: '/images/pfbg_768.jpg',
      sm2x: '/images/pfbg_768@2x.jpg',
      xs: '/images/pfbg_576.jpg',
      xs2x: '/images/pfbg_576@2x.jpg',
    };
  }

  render() {
    return <BackgroundImage src={this.images} />;
  }
}

const adminErrorString = 'Error: Code=52, Message=Error code 52: Not enough privileges.';

function isIAppRouteGroup(arc: AppRouteConfig): arc is IAppRouteGroup {
  return (arc as AppRouteConfig).path == undefined;
}

const App: React.FunctionComponent = () => (
  <Router>
    <SoftetherRouter />
  </Router>
);

const LoadingPage: React.FunctionComponent = () => (
  <Bullseye>
    <LoadingPageBackground />
    <Spinner size="xl" />
  </Bullseye>
);

/* This is needed for hiding admin only paths to hub admins */
class SoftetherRouter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingAdmin: true,
      loadingCluster: true,
      loadigDDNSAzure: true,
      loadingCaps: true,
    };
  }

  componentDidMount() {
    api
      .EnumConnection()
      .then(() => {
        // console.log(response)
        userGlobal = 'Administrator';
        this.setState({ loadingAdmin: false });
      })
      .catch((error) => {
        if (error.toString() === adminErrorString) {
          routes.forEach((route) => {
            if (isIAppRouteGroup(route)) {
              route.routes.forEach((subroute) => {
                if (subroute.isAdmin === true) {
                  delete subroute['label'];
                }
              });
            }
            if (route.isAdmin === true) {
              delete route['label'];
            }
          });
          userGlobal = 'Hub Administrator';
        }
        this.setState({ loadingAdmin: false });
        console.log(error);
      });

    api
      .GetFarmSetting()
      .then((response) => {
        if (response.ServerType_u32 == 1 || response.ServerType_u32 == 2) {
          routes.forEach((route) => {
            if (isIAppRouteGroup(route)) {
              route.routes.forEach((subroute) => {
                if (subroute.isCluster === false) {
                  delete subroute['label'];
                }
              });
            } else {
              if (route.isCluster === false) {
                delete route['label'];
              }
            }
          });
        }

        if (response.ServerType_u32 == 0) {
          routes.forEach((route) => {
            if (isIAppRouteGroup(route) && route.label === 'Settings') {
              route.routes.forEach((subroute) => {
                if (subroute.label === 'Clustering Status') {
                  delete subroute['label'];
                }
              });
            }
          });
        }

        this.setState({ loadingCluster: false });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ loadingCluster: false });
      });

    api
      .GetDDnsClientStatus()
      .then((response) => {
        ddnsHostnameGlobal = response.CurrentHostName_str;

        api
          .GetAzureStatus()
          .then((response) => {
            azureGlobal = response.IsEnabled_bool;

            this.setState({ loadigDDNSAzure: false });
            // console.log(azureGlobal)
            // console.log(ddnsGlobal)
          })
          .catch((error) => {
            this.setState({ loadigDDNSAzure: false });
            console.log(error);
          });
      })
      .catch((error) => {
        this.setState({ loadigDDNSAzure: false });
        console.log(error);
      });

    api
      .GetCaps()
      .then((response) => {
        capsListGlobal = response.CapsList;
        isTapSupported = response.caps_b_tap_supported_u32 == 1; // assign isTapSupported
        isBridgeMode = response.caps_b_bridge_u32 == 1;
        isV4 = response.caps_b_vpn4_u32 == 1;
        ddnsProxy = response.caps_b_support_ddns_proxy_u32 == 1;
        isIpsecCapable = response.caps_b_support_ipsec_u32 == 1;
        isOpenVPNSupported = response.caps_b_support_openvpn_u32 == 1;
        isSSTPSupported = response.caps_b_support_sstp_u32 == 1;

        // hide local bridge functionality
        if (response.caps_b_local_bridge_u32 == 0) {
          deleteLabel('Local Bridge');
        }

        // hide cluster functionality
        if (response.caps_b_support_cluster_u32 == 0) {
          deleteLabel('Clustering Configuration');
        }

        // hide layer 3
        if (response.caps_b_support_layer3_u32 == 0) {
          deleteLabel('Layer 3 Switch');
        }

        // hide azure
        if (response.caps_b_support_azure_u32 == 0) {
          deleteLabel('VPN Azure');
        }

        // hide ddns
        if (response.caps_b_support_ddns_u32 == 0) {
          deleteLabel('Dynamic DNS');
        }

        // hide legacy Protocols
        if(!isIpsecCapable && !isOpenVPNSupported && !isSSTPSupported){
          deleteLabel('Legacy Protocols')
        }

        if (isBridgeMode) {
          routes.forEach((route) => {
            if (isIAppRouteGroup(route)) {
              route.routes.forEach((subroute) => {
                if (subroute.isBridge === false) {
                  delete subroute['label'];
                }
              });
            } else {
              if (route.isBridge === false) {
                delete route['label'];
              }
            }
          });
        }

        this.setState({ loadingCaps: false });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ loadingCaps: false });
      });
  } // componentDidMount

  render() {
    const { loadingAdmin, loadingCluster, loadigDDNSAzure, loadingCaps } = this.state;
    const loading = loadingAdmin || loadingCluster || loadigDDNSAzure || loadingCaps;

    return (
      <React.Fragment>
        {loading ? (
          <LoadingPage />
        ) : (
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        )}
      </React.Fragment>
    );
  }
}

export default App;
