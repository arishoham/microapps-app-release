import '../styles/AppGridBaseTable.module.scss';
import { NextPage, NextPageContext } from 'next';
import { useSelector } from 'react-redux';
import Manager, { Application } from '@pwrdrvr/microapps-datalib';
import * as dynamodb from '@aws-sdk/client-dynamodb';
import { createLogger } from '../utils/logger';
import React from 'react';
import BaseTable, { AutoResizer } from 'react-base-table';
import { TableContainer } from 'carbon-components-react';
import { State } from '../store/reducer';
import { wrapper } from '../store/store';

interface IApplication {
  id: string;
  AppName: string;
  DisplayName: string;
}

interface IVersion {
  id: string;
  AppName: string;
  SemVer: string;
  Type: string;
  Status: string;
  DefaultFile?: string;
  IntegrationID: string;
}

interface IFlatRule {
  id: string;
  key: string;
  AttributeName: string;
  AttributeValue: string;
  SemVer: string;
}

interface IRules {
  AppName: string;
  RuleSet: IFlatRule[];
}

interface IPageProps {
  apps: IApplication[];
  versions: IVersion[];
  rules: IRules;
}

export interface IPageState {
  apps: IApplication[];
  versions: IVersion[];
  rules: IRules;
}

const headersApps = [
  {
    width: 150,
    key: 'AppName',
    dataKey: 'AppName',
    title: 'AppName',
  },
  {
    width: 150,
    key: 'DisplayName',
    dataKey: 'DisplayName',
    title: 'Display Name',
  },
];
const headersVersions = [
  {
    width: 150,
    key: 'AppName',
    dataKey: 'AppName',
    title: 'AppName',
    sortable: true,
  },
  {
    width: 150,
    key: 'SemVer',
    dataKey: 'SemVer',
    title: 'Version',
    sortable: true,
  },
];
const headersRules = [
  {
    width: 150,
    key: 'key',
    dataKey: 'key',
    title: 'Key',
  },
  {
    width: 150,
    key: 'SemVer',
    dataKey: 'SemVer',
    title: 'Version',
  },
];

interface OtherProps {
  getServerSideProp: string;
  appProp: string;
}

const Server: NextPage<OtherProps> = ({ appProp, getServerSideProp }) => {
  const { indexPage } = useSelector<State, State>((state) => state);
  //   return <div></div>;
  // };

  // export default class Home extends React.PureComponent<IPageProps, IPageState> {
  //   constructor(props: IPageProps) {
  //     super(props);

  //     this.state = {
  //       apps: this.props.apps,
  //       versions: this.props.versions,
  //       rules: this.props.rules,
  //     };

  //     this.render = this.render.bind(this);
  //   }

  //   render(): JSX.Element {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
    >
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <TableContainer title={'Applications'} />
        <div style={{ flex: '1 0 auto' }}>
          <AutoResizer>
            {({ width, height }) => (
              <BaseTable
                width={width}
                height={height}
                columns={headersApps}
                data={indexPage.apps}
              />
            )}
          </AutoResizer>
        </div>
      </div>
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          <TableContainer title={'Versions'} />
          <div style={{ flex: '1 0 auto' }}>
            <AutoResizer>
              {({ width, height }) => (
                <BaseTable
                  width={width}
                  height={height}
                  columns={headersVersions}
                  data={indexPage.versions}
                />
              )}
            </AutoResizer>
          </div>
        </div>
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          <TableContainer title={'Rules'} />
          <div style={{ flex: '1 0 auto' }}>
            <AutoResizer>
              {({ width, height }) => (
                <BaseTable
                  width={width}
                  height={height}
                  columns={headersRules}
                  data={indexPage.rules.RuleSet}
                />
              )}
            </AutoResizer>
          </div>
        </div>
      </div>
    </div>
  );
};

let dbclient: dynamodb.DynamoDB;
let manager: Manager;

const testPayload: IPageState = {
  apps: [{ id: 'cat', AppName: 'cat', DisplayName: 'dog' }],
  versions: [
    {
      id: 'cat',
      AppName: 'cat',
      SemVer: '0.0.0',
      DefaultFile: 'index.html',
      Status: 'done?',
      IntegrationID: 'none',
      Type: 'next.js',
    },
  ],
  rules: {
    AppName: 'cat',
    RuleSet: [
      {
        id: 'default',
        key: 'default',
        AttributeName: '',
        AttributeValue: '',
        SemVer: '0.0.0',
      },
    ],
  },
};

export const getServerSideProps = wrapper.getServerSideProps(async ({ store }) => {
  //   return { props: { getServerSideProp: 'bar' } };
  // });

  // // This gets called on every request
  // export async function getServerSideProps(ctx: NextPageContext): Promise<{ props: IPageProps }> {
  const log = createLogger('pages:index'); //, ctx?.req?.url);

  try {
    if (manager === undefined) {
      dbclient = new dynamodb.DynamoDB({});
      manager = new Manager(dbclient);
    }

    // Get the apps
    const appsRaw = await Application.LoadAllAppsAsync(dbclient);
    const apps = [] as IApplication[];
    for (const app of appsRaw) {
      apps.push({ id: app.AppName, AppName: app.AppName, DisplayName: app.DisplayName });
    }
    log.info(`got apps`, apps);

    // Get the versions
    const versionsRaw = await manager.GetVersionsAndRules('release');
    const versions = [] as IVersion[];
    for (const version of versionsRaw.Versions) {
      versions.push({
        id: version.SemVer,
        AppName: version.AppName,
        SemVer: version.SemVer,
        Type: version.Type,
        Status: version.Status,
        //DefaultFile: version.DefaultFile,
        IntegrationID: version.IntegrationID,
      });
    }
    //log.info(`got versions`, versions);

    // Get the rules
    const rules = {} as IRules;
    rules.AppName = versionsRaw.Rules.AppName;
    rules.RuleSet = [];
    for (const key of Object.keys(versionsRaw.Rules.RuleSet)) {
      const rule = versionsRaw.Rules.RuleSet[key];
      rules.RuleSet.push({
        id: key,
        key,
        AttributeName: rule.AttributeName ?? '',
        AttributeValue: rule.AttributeValue ?? '',
        SemVer: rule.SemVer,
      });
    }
    //log.info(`got rules`, versions);

    // Update state with data
    store.dispatch({ type: 'MAIN', payload: { apps, versions, rules } });

    // Pass data to the page via props
    return {};
  } catch (error) {
    log.error(`error getting apps: ${error.message}}`);
    log.error(error);
    store.dispatch({ type: 'MAIN', payload: testPayload });

    return {};
  }
});

export default Server;
