import { parse as parseQs } from "qs";
import React from "react";
import { useIntl } from "react-intl";
import { Route, RouteComponentProps, Switch } from "react-router-dom";

import { WindowTitle } from "../components/WindowTitle";
import {
  agencyTransferDetailsPath,
  AgencyTransferListUrlQueryParams,
  pendingAgencyTransfersPath,
  processedAgencyTransfersPath,
} from "./urls";
import AgencyTransferDetailsComponent from "./views/AgencyTransferDetails";
import PendingAgencyTransferListComponent from "./views/PendingAgencyTransferList";
import ProcessedAgencyTransferListComponent from "./views/ProcessedAgencyTransferList";

const PendingAgencyTransferList: React.FC<RouteComponentProps<any>> = ({ location }) => {
  const qs = parseQs(location.search.substr(1)) as any;
  const params: AgencyTransferListUrlQueryParams = qs;
  return <PendingAgencyTransferListComponent params={params} />;
};

const ProcessedAgencyTransferList: React.FC<RouteComponentProps<any>> = ({ location }) => {
  const qs = parseQs(location.search.substr(1)) as any;
  const params: AgencyTransferListUrlQueryParams = qs;
  return <ProcessedAgencyTransferListComponent params={params} />;
};

const AgencyTransferDetails: React.FC<RouteComponentProps<{ id: string }>> = ({
  location,
  match,
}) => {
  const qs = parseQs(location.search.substr(1));
  const params = qs;
  const id = decodeURIComponent(match.params.id);

  return <AgencyTransferDetailsComponent id={id} params={params} />;
};

const AgencyTransfersSection: React.FC = () => {
  const intl = useIntl();

  return (
    <>
      <WindowTitle
        title={intl.formatMessage({ id: "agency_transfers", defaultMessage: "Agency Transfers" })}
      />
      <Switch>
        <Route exact path={pendingAgencyTransfersPath} component={PendingAgencyTransferList} />
        <Route exact path={processedAgencyTransfersPath} component={ProcessedAgencyTransferList} />
        <Route path={agencyTransferDetailsPath(":id")} component={AgencyTransferDetails} />
      </Switch>
    </>
  );
};

export default AgencyTransfersSection;
