#
# vim: syntax=spec

%define V5_VERSION 5.02.5180
%define V4_VERSION 4.38-9760-rtm
%define console_path src/bin/hamcore/wwwroot/admin/manager
%define systemd_unit_path %{_prefix}/lib/systemd/system

%define unit_gen()\
if [ %1 == "5" ]; then\
echo "[Unit]\
Description=SoftEther%1 VPN %2\
After=network.target auditd.service\
ConditionPathExists=!%{_sharedstatedir}/softether%1/vpn%2/do_not_run\
\
[Service]\
Type=forking\
ExecStart=%{_libexecdir}/softether%1/vpn%2/vpn%2 start\
ExecStop=%{_libexecdir}/softether%1/vpn%2/vpn%2 stop\
LogsDirectory=softether%1\
RuntimeDirectory=softether%1\
KillMode=process\
Restart=on-failure\
\
# Hardening\
PrivateTmp=yes\
ProtectHome=yes\
ProtectSystem=full\
ReadOnlyPaths=/\
ReadWritePaths=-%{_sysconfdir}/softether%1\
ReadWritePaths=-/run/softether%1\
ReadWritePaths=-/var/log/softether%1\
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_BIND_SERVICE CAP_NET_BROADCAST CAP_NET_RAW CAP_SYS_NICE CAP_SYSLOG CAP_SETUID\
\
[Install]\
WantedBy=multi-user.target" > %{buildroot}/%{systemd_unit_path}/softether%1-%2.service; \
else\
echo "[Unit]\
Description=SoftEther%1 VPN %2\
After=network.target auditd.service\
ConditionPathExists=!%{_libexecdir}/softether%1/vpn%2/do_not_run\
\
[Service]\
Type=forking\
ExecStart=%{_libexecdir}/softether%1/vpn%2/vpn%2 start\
ExecStop=%{_libexecdir}/softether%1/vpn%2/vpn%2 stop\
KillMode=process\
Restart=on-failure\
\
# Hardening\
PrivateTmp=yes\
ProtectHome=yes\
ProtectSystem=full\
ReadOnlyPaths=/\
ReadWritePaths=-%{_libexecdir}/softether%1/vpn%2\
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_BIND_SERVICE CAP_NET_BROADCAST CAP_NET_RAW CAP_SYS_NICE CAP_SYS_ADMIN CAP_SETUID\
\
[Install]\
WantedBy=multi-user.target" > %{buildroot}/%{systemd_unit_path}/softether%1-%2.service;\
fi

### Main package aka sources
Name:       SoftEtherVPN-patternfly-sources
Version:    {{{ git_dir_version }}}
Release:    1%{?dist}

Summary:    A PatternFly 4 web administration console for SoftEtherVPN Software
License:    BSD-3

URL:        https://github.com/Leuca/softether-patternfly-ui

# Detailed information about the source Git repository and the source commit
# for the created rpm package
VCS:        {{{ git_dir_vcs }}}

BuildRequires:	npm wget cmake ncurses-devel openssl-devel libsodium-devel readline-devel zlib-devel
BuildRequires:  gettext diffstat doxygen git patch patchutils subversion systemtap
BuildRequires:  nodejs

Source:     {{{ git_dir_pack }}}

%package -n SoftEtherVPN5-common
Summary:	SoftEtherVPN version 5 common files
License:	Apache License Version 2.0
URL:	https://github.com/SoftEtherVPN/SoftEtherVPN

%package -n SoftEtherVPN5-server
Summary:        SoftEtherVPN version 5 server
License:        Apache License Version 2.0
Requires:	SoftEtherVPN5-common
URL:    https://github.com/SoftEtherVPN/SoftEtherVPN

%package -n SoftEtherVPN5-client
Summary:        SoftEtherVPN version 5 client
License:        Apache License Version 2.0
Requires:       SoftEtherVPN5-common
URL:    https://github.com/SoftEtherVPN/SoftEtherVPN

%package -n SoftEtherVPN5-bridge
Summary:        SoftEtherVPN version 5 bridge
License:        Apache License Version 2.0
Requires:       SoftEtherVPN5-common
URL:    https://github.com/SoftEtherVPN/SoftEtherVPN

%package -n SoftEtherVPN4-common
Summary:        SoftEtherVPN version 4 common files
License:        Apache License Version 2.0
URL:	https://github.com/SoftEtherVPN/SoftEtherVPN_Stable

%package -n SoftEtherVPN4-server
Summary:        SoftEtherVPN version 4 server
License:        Apache License Version 2.0
Requires:       SoftEtherVPN4-common
URL:    https://github.com/SoftEtherVPN/SoftEtherVPN_Stable

%package -n SoftEtherVPN4-client
Summary:        SoftEtherVPN version 4 client
License:        Apache License Version 2.0
Requires:       SoftEtherVPN4-common
URL:    https://github.com/SoftEtherVPN/SoftEtherVPN_Stable

%package -n SoftEtherVPN4-bridge
Summary:        SoftEtherVPN version 4 bridge
License:        Apache License Version 2.0
Requires:       SoftEtherVPN4-common
URL:    https://github.com/SoftEtherVPN/SoftEtherVPN_Stable


## Descriptions
%description
Source code for the Web Administration Console for SoftEtherVPN Server made using the PatternFly 4 react framework

%description -n SoftEtherVPN5-common
SoftEther VPN ("SoftEther" means "Software Ethernet") is one of the
world's most powerful and easy-to-use multi-protocol VPN software.
This package contains version 5 common files and provides the vpncmd command.

%description -n SoftEtherVPN4-common
SoftEther VPN ("SoftEther" means "Software Ethernet") is one of the
world's most powerful and easy-to-use multi-protocol VPN software.
This package contains version 4 common files and provides the vpncmd command.

%description -n SoftEtherVPN5-server
SoftEther VPN ("SoftEther" means "Software Ethernet") is one of the
world's most powerful and easy-to-use multi-protocol VPN software.
This package contains version 5 server files and binary.

%description -n SoftEtherVPN4-server
SoftEther VPN ("SoftEther" means "Software Ethernet") is one of the
world's most powerful and easy-to-use multi-protocol VPN software.
This package contains version 4 server files and provides the vpncmd command.

%description -n SoftEtherVPN5-bridge
SoftEther VPN ("SoftEther" means "Software Ethernet") is one of the
world's most powerful and easy-to-use multi-protocol VPN software.
This package contains version 5 bridge files and binary.

%description -n SoftEtherVPN4-bridge
SoftEther VPN ("SoftEther" means "Software Ethernet") is one of the
world's most powerful and easy-to-use multi-protocol VPN software.
This package contains version 4 bridge files and provides the vpncmd command.

%description -n SoftEtherVPN5-client
SoftEther VPN ("SoftEther" means "Software Ethernet") is one of the
world's most powerful and easy-to-use multi-protocol VPN software.
This package contains version 5 client files and binary.

%description -n SoftEtherVPN4-client
SoftEther VPN ("SoftEther" means "Software Ethernet") is one of the
world's most powerful and easy-to-use multi-protocol VPN software.
This package contains version 4 client files and provides the vpncmd command.

%prep
{{{ git_dir_setup_macro }}}
git clone -b %{V5_VERSION} https://github.com/SoftEtherVPN/SoftEtherVPN.git
mv SoftEtherVPN SoftEtherVPN-%{V5_VERSION}
pushd SoftEtherVPN-%{V5_VERSION}
git submodule init && git submodule update
pushd ..
wget https://github.com/SoftEtherVPN/SoftEtherVPN_Stable/archive/refs/tags/v%{V4_VERSION}.tar.gz
tar -xvf v%{V4_VERSION}.tar.gz

%build
# Build console
npm install
npm run build
# Put the console in the source tree
mkdir SoftEtherVPN-%{V5_VERSION}/%{console_path}
cp -r dist/* SoftEtherVPN-%{V5_VERSION}/%{console_path}
mkdir SoftEtherVPN_Stable-%{V4_VERSION}/%{console_path}
cp -r dist/* SoftEtherVPN_Stable-%{V4_VERSION}/%{console_path}
pushd SoftEtherVPN-%{V5_VERSION}
git submodule init && git submodule update
CMAKE_FLAGS="-DSKIP_CPU_FEATURES -DCMAKE_INSTALL_PREFIX=%{_prefix} -DCMAKE_INSTALL_SYSTEMD_UNITDIR=junk/ -DSE_PIDDIR=%{_rundir}/softether5 -DSE_LOGDIR=%{_localstatedir}/log/softether5 -DSE_DBDIR=%{_sysconfdir}/softether5" ./configure
make -C build
# Now build v4
pushd ../SoftEtherVPN_Stable-%{V4_VERSION}
./configure
make

%install
mkdir -p %{buildroot}/%{_bindir}
mkdir -p %{buildroot}/%{_rundir}/softether5
mkdir -p %{buildroot}/%{_localstatedir}/log/softether5
mkdir -p %{buildroot}/%{_sharedstatedir}/softether5
mkdir -p %{buildroot}/%{systemd_unit_path}
mkdir -p %{buildroot}/%{_sysconfdir}/softether5
pushd SoftEtherVPN-%{V5_VERSION}
make DESTDIR=%{buildroot} -C build install
rm -rf %{buildroot}/%{_bindir}
mv %{buildroot}/%{_libexecdir}/softether %{buildroot}/%{_libexecdir}/softether5
pushd ../SoftEtherVPN_Stable-%{V4_VERSION}
mkdir -p %{buildroot}/%{_bindir}
INSTALL_BINDIR=%{buildroot}/%{_bindir}/ INSTALL_VPNSERVER_DIR=%{buildroot}/%{_libexecdir}/softether4/vpnserver/ INSTALL_VPNBRIDGE_DIR=%{buildroot}/%{_libexecdir}/softether4/vpnbridge/ INSTALL_VPNCLIENT_DIR=%{buildroot}/%{_libexecdir}/softether4/vpnclient/ INSTALL_VPNCMD_DIR=%{buildroot}/%{_libexecdir}/softether4/vpncmd/ make -e install
rm -rf %{buildroot}/%{_bindir}
# Create systemd units
%unit_gen "5" "server"
%unit_gen "5" "bridge"
%unit_gen "5" "client"
%unit_gen "4" "server"
%unit_gen "4" "bridge"
%unit_gen "4" "client"
# Create scripts for vpncmd
mkdir -p %{buildroot}/%{_bindir}
echo "#!/bin/sh
%{_libexecdir}/softether5/vpncmd/vpncmd \"\$@\"
exit $?" > %{buildroot}/%{_bindir}/vpncmd5
chmod 755 %{buildroot}/%{_bindir}/vpncmd5
echo "#!/bin/sh
%{_libexecdir}/softether4/vpncmd/vpncmd \"\$@\"
exit $?" > %{buildroot}/%{_bindir}/vpncmd4
chmod 755 %{buildroot}/%{_bindir}/vpncmd4
# Install sources
mkdir -p %{buildroot}/%{_usrsrc}/SoftEtherVPN-patternfly-sources
wget https://github.com/Leuca/softether-patternfly-ui/archive/refs/heads/master.zip
mv master.zip %{buildroot}/%{_usrsrc}/SoftEtherVPN-patternfly-sources


%files
%license LICENSE
%{_usrsrc}/SoftEtherVPN-patternfly-sources/master.zip

%files -n SoftEtherVPN5-common
%license SoftEtherVPN-%{V5_VERSION}/LICENSE
%{_sysconfdir}/softether5
%{_libexecdir}/softether5
%{_libexecdir}/softether5/vpncmd/vpncmd
%{_libexecdir}/softether5/vpncmd/hamcore.se2
%{_bindir}/vpncmd5
%{_rundir}/softether5
%{_localstatedir}/log/softether5
%{_libdir}/libcedar.so
%{_libdir}/libmayaqua.so


%files -n SoftEtherVPN5-server
%license SoftEtherVPN-%{V5_VERSION}/LICENSE
%{_libexecdir}/softether5/vpnserver/vpnserver
%{_libexecdir}/softether5/vpnserver/hamcore.se2
%{systemd_unit_path}/softether5-server.service

%files -n SoftEtherVPN5-bridge
%license SoftEtherVPN-%{V5_VERSION}/LICENSE
%{_libexecdir}/softether5/vpnbridge/vpnbridge
%{_libexecdir}/softether5/vpnbridge/hamcore.se2
%{systemd_unit_path}/softether5-bridge.service

%files -n SoftEtherVPN5-client
%license SoftEtherVPN-%{V5_VERSION}/LICENSE
%{_libexecdir}/softether5/vpnclient/vpnclient
%{_libexecdir}/softether5/vpnclient/hamcore.se2
%{systemd_unit_path}/softether5-client.service

%files -n SoftEtherVPN4-common
%license SoftEtherVPN_Stable-%{V4_VERSION}/LICENSE
%{_libexecdir}/softether4
%{_libexecdir}/softether4/vpncmd/vpncmd
%{_libexecdir}/softether4/vpncmd/hamcore.se2
%{_bindir}/vpncmd4

%files -n SoftEtherVPN4-server
%license SoftEtherVPN_Stable-%{V4_VERSION}/LICENSE
%{_libexecdir}/softether4/vpnserver/vpnserver
%{_libexecdir}/softether4/vpnserver/hamcore.se2
%{systemd_unit_path}/softether4-server.service

%files -n SoftEtherVPN4-bridge
%license SoftEtherVPN_Stable-%{V4_VERSION}/LICENSE
%{_libexecdir}/softether4/vpnbridge/vpnbridge
%{_libexecdir}/softether4/vpnbridge/hamcore.se2
%{systemd_unit_path}/softether4-bridge.service

%files -n SoftEtherVPN4-client
%license SoftEtherVPN_Stable-%{V4_VERSION}/LICENSE
%{_libexecdir}/softether4/vpnclient/vpnclient
%{_libexecdir}/softether4/vpnclient/hamcore.se2
%{systemd_unit_path}/softether4-client.service

%changelog
{{{ git_dir_changelog }}}