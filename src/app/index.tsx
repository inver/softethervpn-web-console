import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { HashRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes, routes, IAppRouteGroup, AppRouteConfig } from '@app/routes';
import '@app/app.css';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import { BackgroundImage } from '@patternfly/react-core';

export let userGlobal = "";
export let ddnsGlobal = "";
export let azureGlobal = "";

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
      xs2x: '/images/pfbg_576@2x.jpg'
    };
  }
  render() {
    return (
      <BackgroundImage src={this.images} />
    );
  }
}

const adminErrorString = "Error: Code=52, Message=Error code 52: Not enough privileges.";

function isIAppRouteGroup(arc: AppRouteConfig): arc is IAppRouteGroup
{
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
  <Spinner size="xl"/>
  </Bullseye>
);

/* This is needed for hiding admin only paths to hub admins */
class SoftetherRouter extends React.Component {
  constructor(props){
    super(props);
    this.state = { loadingAdmin: true, loadingCluster: true, loadigDDNS: true, loadingAzure:true, user: "Administrator" };
  }

  componentDidMount(){
    api.EnumConnection()
    .then( response => {
      // console.log(response)
      userGlobal = "Administrator"
      this.setState({ loadingAdmin: false });
    })
    .catch( error => {
      if(error.toString() === adminErrorString){
        routes.forEach(route => {
            if(isIAppRouteGroup(route)){
              route.routes.forEach(subroute => {
                if(subroute.isAdmin === true){
                  delete subroute["label"];
                }
              });
            }
            else{
              if(route.isAdmin === true){
                delete route["label"];
              }
            }
          });
      }
    userGlobal = "Hub Administrator"
      this.setState({ loadingAdmin: false, user: "Hub Administrator"});
    });

    api.GetFarmSetting()
    .then( response => {
      if( response.ServerType_u32 == 1 || response.ServerType_u32 == 2){
        routes.forEach(route => {
            if(isIAppRouteGroup(route)){
              route.routes.forEach(subroute => {
                if(subroute.isCluster === false){
                  delete subroute["label"];
                }
              });
            }
            else{
              if(route.isCluster === false){
                delete route["label"];
              }
            }
          });
      }

      if( response.ServerType_u32 == 0 ){
        routes.forEach(route => {
          if(isIAppRouteGroup(route) && route.label === "Settings"){
            route.routes.forEach(subroute => {
              if(subroute.label === "Clustering Status"){
                delete subroute["label"]
              }
            });
          }
        });
      }

      this.setState({ loadingCluster: false });
    })
    .catch( error => {
      console.log(error)
      this.setState({ loadingCluster: false });
    });

    api.GetDDnsClientStatus()
    .then( response => {
      ddnsGlobal = response.CurrentFqdn_str;
      let ag = response.CurrentHostName_str;

      api.GetAzureStatus()
      .then( response => {
        if(response.IsEnabled_bool){
          azureGlobal = ag.concat(".vpnazure.net");
        }
        this.setState({ loadigDDNS: false, loadingAzure: false });
        // console.log(azureGlobal)
        // console.log(ddnsGlobal)
      })
      .catch( error => {
        this.setState({ loadigDDNS: false, loadingAzure: false });
      });

    })
    .catch( error => {
      this.setState({ loadigDDNS: false, loadingAzure: false });
    });
  } // componentDidMount

  render(){
    const { loadingAdmin, loadingCluster, loadigDDNS, loadigAzure, user} = this.state;


    return (
      <React.Fragment>
      { loadingAdmin || loadingCluster || loadigDDNS || loadigAzure ? <LoadingPage /> :
      <AppLayout>
        <AppRoutes />
      </AppLayout>}

      </React.Fragment>
    );
  }
}

export default App;
