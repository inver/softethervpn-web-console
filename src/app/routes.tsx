import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { accessibleRouteChangeHandler } from '@app/utils/utils';
import { Dashboard } from '@app/Dashboard/Dashboard';
import { Support } from '@app/Support/Support';
import { LocalBridge } from '@app/Functionalities/LocalBridge/LocalBridge';
import { Layer3Switch } from '@app/Functionalities/Layer3Switch/Layer3Switch';
import { DynDNS } from '@app/Functionalities/DDNS/DDNS';
import { VpnAzure } from '@app/Functionalities/VPNAzure/VPNAzure';
import { Listeners } from '@app/Settings/Listeners/Listeners';
import { EncryptionNetwork } from '@app/Settings/EncryptionAndNetwork/EncryptionAndNetwork';
import { ClusterConfig } from '@app/Settings/ClusterConfiguration/ClusterConfiguration';
import { ClusteringStatus } from '@app/Settings/ClusteringStatus/ClusteringStatus';
import { EditConfig } from '@app/Settings/EditConfig/EditConfig';
import { ConnectionsList } from '@app/Settings/ConnectionsList/ConnectionsList';
import { ServerStatus } from '@app/Settings/ServerStatus/ServerStatus';
import { About } from '@app/Settings/About/AboutThisServer';
import { NotFound } from '@app/NotFound/NotFound';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { LastLocationProvider, useLastLocation } from 'react-router-last-location';

let routeFocusTimer: number;
export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  exact?: boolean;
  path: string;
  title: string;
  isAsync?: boolean;
  routes?: undefined;
  isAdmin?: boolean;
  isCluster?: boolean;
  isBridge?: boolean;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
  isAdmin?: boolean;
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [
  {
    component: Dashboard,
    exact: true,
    label: 'Dashboard',
    path: '/',
    title: 'SoftEther VPN Console | Main Dashboard',
  },
  {
    component: Support,
    exact: true,
    isAsync: true,
    label: 'Support',
    path: '/support',
    title: 'SoftEther VPN Console | Support Page',
  },
  {
    label: 'Functionalities',
    routes: [
      {
        component: LocalBridge,
        exact: true,
        isAsync: true,
        label: 'Local Bridge',
        path: '/functionalities/localbridge',
        title: 'SoftEther VPN Console | Local Bridge',
      },
      {
        component: Layer3Switch,
        exact: true,
        isAsync: true,
        label: 'Layer 3 Switch',
        path: '/functionalities/layer3switch',
        title: 'SoftEther VPN Console | Layer 3 Switch',
      },
      {
        component: DynDNS,
        exact: true,
        isAsync: true,
        label: 'Dynamic DNS',
        path: '/functionalities/ddns',
        title: 'SoftEther VPN Console | Dynamic DNS',
      },
      {
        component: VpnAzure,
        exact: true,
        isAsync: true,
        label: 'VPN Azure',
        path: '/functionalities/vpnazure',
        title: 'SoftEther VPN Console | VPN Azure',
      },
    ],
    isAdmin: true,
  },
  {
    label: 'Settings',
    routes: [
      {
        component: Listeners,
        exact: true,
        isAsync: true,
        label: 'Listeners',
        path: '/settings/listeners',
        title: 'SoftEther VPN Console | Listeners',
        isAdmin: true,
      },
      {
        component: EncryptionNetwork,
        exact: true,
        isAsync: true,
        label: 'Encryption And Network',
        path: '/settings/encryptionandnetwork',
        title: 'SoftEther VPN Console | Encryption And Network',
      },
      {
        component: ClusterConfig,
        exact: true,
        isAsync: true,
        label: 'Clustering Configuration',
        path: '/settings/clusterconfig',
        title: 'SoftEther VPN Console | Clustering Configuration',
        isAdmin: true,
        isBridge: true,
      },
      {
        component: ClusteringStatus,
        exact: true,
        isAsync: true,
        label: 'Clustering Status',
        path: '/settings/clusterstatus',
        title: 'SoftEther VPN Console | Clustering Status',
      },
      {
        component: EditConfig,
        exact: true,
        isAsync: true,
        label: 'Edit Configuration',
        path: '/settings/editconfig',
        title: 'SoftEther VPN Console | Edit Config File',
        isAdmin: true,
      },
      {
        component: ConnectionsList,
        exact: true,
        isAsync: true,
        label: 'Connections List',
        path: '/settings/connections',
        title: 'SoftEther VPN Console | Connections List',
        isAdmin: true,
      },
      {
        component: ServerStatus,
        exact: true,
        isAsync: true,
        label: 'Server Status',
        path: '/settings/serverstatus',
        title: 'SoftEther VPN Console | Server Status',
      },
      {
        component: About,
        exact: true,
        isAsync: true,
        label: 'About This VPN Server',
        path: '/settings/about',
        title: 'SoftEther VPN Console | About This VPN Server',
      },
    ],
  },
];

// a custom hook for sending focus to the primary content container
// after a view has loaded so that subsequent press of tab key
// sends focus directly to relevant content
const useA11yRouteChange = (isAsync: boolean) => {
  const lastNavigation = useLastLocation();
  React.useEffect(() => {
    if (!isAsync && lastNavigation !== null) {
      routeFocusTimer = accessibleRouteChangeHandler();
    }
    return () => {
      window.clearTimeout(routeFocusTimer);
    };
  }, [isAsync, lastNavigation]);
};

const RouteWithTitleUpdates = ({ component: Component, isAsync = false, title, ...rest }: IAppRoute) => {
  useA11yRouteChange(isAsync);
  useDocumentTitle(title);

  function routeWithTitle(routeProps: RouteComponentProps) {
    return <Component {...rest} {...routeProps} />;
  }

  return <Route render={routeWithTitle} />;
};

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotFound} />;
};

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[]
);

const AppRoutes = (): React.ReactElement => (
  <LastLocationProvider>
    <Switch>
      {flattenedRoutes.map(({ path, exact, component, title, isAsync }, idx) => (
        <RouteWithTitleUpdates
          path={path}
          exact={exact}
          component={component}
          key={idx}
          title={title}
          isAsync={isAsync}
        />
      ))}
      <PageNotFound title="404 Page Not Found" />
    </Switch>
  </LastLocationProvider>
);

export { AppRoutes, routes };
