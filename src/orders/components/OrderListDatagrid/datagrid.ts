// @ts-strict-ignore
import {
  dateCell,
  moneyCell,
  pillCell,
  readonlyTextCell,
  statusCell,
  textCell,
} from "@dashboard/components/Datagrid/customCells/cells";
import {
  hueToPillColorLight,
  PillColor,
} from "@dashboard/components/Datagrid/customCells/PillCell";
import { GetCellContentOpts } from "@dashboard/components/Datagrid/Datagrid";
import { AvailableColumn } from "@dashboard/components/Datagrid/types";
import {
  OrderChargeStatusEnum,
  OrderListQuery,
  OrderStatus,
  PaymentChargeStatusEnum,
  UserType,
} from "@dashboard/graphql";
import {
  getStatusColor,
  transformChargedStatus,
  transformDeliveryStatus,
  transformOrderStatus,
  transformPaymentStatus,
} from "@dashboard/misc";
import { OrderListUrlSortField } from "@dashboard/orders/urls";
import { RelayToFlat, Sort, StatusType } from "@dashboard/types";
import { getColumnSortDirectionIcon } from "@dashboard/utils/columns/getColumnSortDirectionIcon";
import { GridCell, Item, TextCell } from "@glideapps/glide-data-grid";
import { DefaultTheme, useTheme } from "@saleor/macaw-ui-next";
import { IntlShape, useIntl } from "react-intl";

import { columnsMessages } from "./messages";

export const orderListStaticColumnAdapter = (intl: IntlShape, sort: Sort<OrderListUrlSortField>) =>
  [
    {
      id: "number",
      title: "주문번호",
      width: 100,
    },
    {
      id: "date",
      title: intl.formatMessage(columnsMessages.date),
      width: 300,
    },
    {
      id: "customer",
      title: intl.formatMessage(columnsMessages.customer),
      width: 200,
    },
    {
      id: "payment",
      title: intl.formatMessage(columnsMessages.payment),
      width: 100,
    },
    {
      id: "status",
      title: intl.formatMessage(columnsMessages.status),
      width: 100,
    },
    {
      id: "paidDate",
      title: "결제일",
      width: 300,
    },
    {
      id: "total",
      title: "금액",
      width: 150,
    },
    {
      id: "quantity",
      title: "총수량",
      width: 120,
    },
  ].map(column => ({
    ...column,
    icon: getColumnSortDirectionIcon(sort, column.id),
  }));

interface GetCellContentProps {
  columns: AvailableColumn[];
  orders: RelayToFlat<OrderListQuery["orders"]>;
}

function getDatagridRowDataIndex(row, removeArray) {
  return row + removeArray.filter(r => r <= row).length;
}

export const useGetCellContent = ({ columns, orders }: GetCellContentProps) => {
  const intl = useIntl();
  const { theme } = useTheme();

  return ([column, row]: Item, { added, removed }: GetCellContentOpts): GridCell => {
    const columnId = columns[column]?.id;
    const rowData = added.includes(row) ? undefined : orders[getDatagridRowDataIndex(row, removed)];

    if (!columnId || !rowData) {
      return readonlyTextCell("");
    }

    switch (columnId) {
      case "number":
        return readonlyTextCell(rowData.number);
      case "date":
        return getDateCellContent(rowData);
      case "customer":
        return getCustomerCellContent(rowData);
      case "payment":
        return getPaymentCellContent(intl, theme, rowData);
      case "status":
        return getStatusCellContent(intl, theme, rowData);
      case "paidDate":
        return getPaidDateCellContent(rowData);
      case "total":
        return getTotalCellContent(rowData);
      case "quantity":
        return getQuantityCellContent(rowData);
      case "channel":
        return getChannelCellContent(rowData);
      default:
        return textCell("");
    }
  };
};

const COMMON_CELL_PROPS: Partial<GridCell> = { cursor: "pointer" };

export function getDateCellContent(rowData: RelayToFlat<OrderListQuery["orders"]>[number]) {
  return dateCell(rowData?.created, COMMON_CELL_PROPS);
}

export function getCustomerCellContent(
  rowData: RelayToFlat<OrderListQuery["orders"]>[number],
): GridCell {
  let displayName = "-";

  // 기존 고객명 표시 로직
  if (rowData?.billingAddress?.firstName && rowData?.billingAddress?.lastName) {
    displayName = `${rowData.billingAddress.firstName} ${rowData.billingAddress.lastName}`;
  } else if (rowData?.user?.businessName) {
    displayName = rowData.user.businessName;
  }

  const isExpress = rowData?.metadata?.some(
    (m: any) => m.key === "is_express_delivery" && m.value === "true",
  );

  const userType = rowData?.user?.userType;

  // 1. 급송 처리
  if (isExpress) {
    const expressDisplayName = `${displayName} (급송)`;
    return statusCell("error", expressDisplayName, COMMON_CELL_PROPS);
  }

  // 2. 고객 유형 처리
  if (userType) {
    let tagText = "";
    // ✅ 변수 타입을 string이 아닌 'PillColor'로 지정합니다.
    let pillColor: PillColor | null = null;

    if (userType === UserType.HOSPITAL) {
      tagText = "[병원]";
      // ✅ hueToPillColorLight 함수를 사용하여 'PillColor' 객체를 생성합니다.
      // 숫자는 색상(hue) 값이며, 210은 파란색 계열입니다.
      pillColor = hueToPillColorLight(210);
    } else if (userType === UserType.AGENCY) {
      tagText = "[대리점]";
      // ✅ 140은 녹색 계열입니다.
      pillColor = hueToPillColorLight(140);
    }

    if (tagText) {
      const fullDisplayName = `${displayName} ${tagText}`;
      // ✅ 생성된 PillColor 객체를 pillCell 함수에 전달합니다.
      return pillCell(fullDisplayName, pillColor, COMMON_CELL_PROPS);
    }
  }

  // 3. 기본 처리
  return readonlyTextCell(displayName, true, "normal");
}

export function getStatusCellContent(
  intl: IntlShape,
  currentTheme: DefaultTheme,
  rowData: RelayToFlat<OrderListQuery["orders"]>[number],
) {
  if (rowData.status === OrderStatus.COMPLETED) {
    const color = getStatusColor({
      status: "success",
      currentTheme,
    });

    return pillCell("처리 완료", color, COMMON_CELL_PROPS);
  }

  if (rowData.status === OrderStatus.FULFILLED) {
    const userType = rowData?.user?.userType;
    if (userType === UserType.AGENCY) {
      const transformedDeliveryStatus = {
        localized: "출고 완료",
        status: StatusType.INFO, // 파란색 계열
      };
      const color = getStatusColor({
        status: transformedDeliveryStatus.status,
        currentTheme,
      });

      return pillCell(transformedDeliveryStatus.localized, color, COMMON_CELL_PROPS);
    }

    const deliveryStatus = rowData.fulfillments?.[0]?.deliveryStatus;

    if (deliveryStatus) {
      const transformedDeliveryStatus = transformDeliveryStatus(deliveryStatus);

      if (transformedDeliveryStatus) {
        const color = getStatusColor({
          status: transformedDeliveryStatus.status,
          currentTheme,
        });

        return pillCell(transformedDeliveryStatus.localized, color, COMMON_CELL_PROPS);
      }
    }
  }

  const orderStatus = transformOrderStatus(rowData.status, intl);

  if (orderStatus) {
    const color = getStatusColor({
      status: orderStatus.status,
      currentTheme,
    });

    return pillCell(orderStatus.localized, color, COMMON_CELL_PROPS);
  }

  return readonlyTextCell("-");
}

export function getPaidDateCellContent(rowData: RelayToFlat<OrderListQuery["orders"]>[number]) {
  // 1. 주문 자체가 취소되었으면 빈 값
  if (rowData.status === OrderStatus.CANCELED) {
    return readonlyTextCell("-");
  }

  // 2. 주문의 전체 결제 상태가 '완료'가 아니면 빈 값
  if (rowData.paymentStatus !== PaymentChargeStatusEnum.FULLY_CHARGED) {
    return readonlyTextCell("-");
  }

  // 3. 메타데이터 (신규 데이터) 우선 확인
  const paidAtMeta = rowData.metadata.find(m => m.key === "paid_at");
  if (paidAtMeta?.value) {
    return dateCell(paidAtMeta.value, COMMON_CELL_PROPS);
  }

  // 4. 이전 데이터(Legacy) 처리
  if (rowData.payments && rowData.payments.length > 0) {
    // 배열 중에서 상태가 'FULLY_CHARGED'인 것만 필터링합니다.
    // (쿼리에 chargeStatus 필드를 추가했으므로 사용 가능)
    const chargedPayments = rowData.payments.filter(
      p => p.chargeStatus === PaymentChargeStatusEnum.FULLY_CHARGED,
    );

    // 성공한 결제 건이 하나라도 있다면
    if (chargedPayments.length > 0) {
      // 그중 가장 마지막(최신) 항목의 수정 시간을 사용합니다.
      const lastSuccessPayment = chargedPayments[chargedPayments.length - 1];

      if (lastSuccessPayment.modified) {
        return dateCell(lastSuccessPayment.modified, COMMON_CELL_PROPS);
      }
    }
  }

  // 위 조건에 모두 해당하지 않으면 (결제 완료 상태인데 기록을 못 찾음)
  return readonlyTextCell("-");
}

export function getFulfillmentDateCellContent(
  rowData: RelayToFlat<OrderListQuery["orders"]>[number],
) {
  const fulfillmentDate = rowData.fulfillments?.[0]?.created;

  if (fulfillmentDate) {
    return dateCell(fulfillmentDate, COMMON_CELL_PROPS);
  }

  return readonlyTextCell("-");
}

const higherPriorityChargeStatuses = [OrderChargeStatusEnum.OVERCHARGED];

export function getPaymentCellContent(
  intl: IntlShape,
  currentTheme: DefaultTheme,
  rowData: RelayToFlat<OrderListQuery["orders"]>[number],
) {
  if (rowData.status === OrderStatus.CANCELED) {
    const orderStatus = transformOrderStatus(rowData.status, intl);

    if (orderStatus) {
      const color = getStatusColor({
        status: orderStatus.status,
        currentTheme,
      });

      return pillCell("결제 취소됨", color, COMMON_CELL_PROPS);
    }
  }

  // --- 기존 로직 ---
  if (higherPriorityChargeStatuses.includes(rowData.chargeStatus)) {
    const { localized, status } = transformChargedStatus(rowData.chargeStatus, intl);
    const color = getStatusColor({
      status,
      currentTheme,
    });
    return pillCell(localized, color, COMMON_CELL_PROPS);
  }

  const paymentStatus = transformPaymentStatus(rowData.paymentStatus, intl);

  if (paymentStatus) {
    const color = getStatusColor({
      status: paymentStatus.status,
      currentTheme,
    });
    return pillCell(paymentStatus.localized, color, COMMON_CELL_PROPS);
  }

  return readonlyTextCell("-");
}

export function getTotalCellContent(rowData: RelayToFlat<OrderListQuery["orders"]>[number]) {
  // --- 이 부분은 원래 있던 코드 그대로입니다 ---
  if (rowData?.total?.gross?.amount !== undefined) {
    const amount = rowData.total.gross.amount;
    const formattedAmount = amount.toLocaleString();
    let totalString = `${formattedAmount}원`; // let으로 변경하여 수정 가능하게 함
    // --- 여기까지 원래 코드 ---

    // ✅ 이 부분만 추가됩니다.
    // 메타데이터에서 토큰 결제 여부를 확인합니다.
    const isTokenPaymentMeta = rowData.metadata.find(
      meta => meta.key === "type" && meta.value === "TOKEN_PAYMENT",
    );

    if (isTokenPaymentMeta) {
      // 토큰 결제 정보를 메타데이터에서 추출합니다.
      const gnoAmountMeta = rowData.metadata.find(m => m.key === "finalGnoAmount");
      const gnoAmount = gnoAmountMeta ? parseFloat(gnoAmountMeta.value) : 0;

      // 기존 원화 금액 문자열에 GNO 금액을 덧붙입니다.
      if (gnoAmount > 0) {
        totalString += ` (${gnoAmount.toLocaleString()} GNO)`;
      }
    }
    // ✅ 추가된 부분 끝

    return readonlyTextCell(totalString);
  }

  return readonlyTextCell("-");
}

export function getQuantityCellContent(
  rowData: RelayToFlat<OrderListQuery["orders"]>[number],
): TextCell {
  if (rowData?.lines) {
    // 주문의 모든 라인 아이템의 수량을 합산합니다.
    const totalQuantity = rowData.lines.reduce((acc, line) => acc + line.quantity, 0);

    return readonlyTextCell(totalQuantity.toLocaleString());
  }

  return readonlyTextCell("-");
}

export function getChannelCellContent(
  rowData: RelayToFlat<OrderListQuery["orders"]>[number],
): TextCell {
  if (rowData?.channel?.name) {
    return readonlyTextCell(rowData.channel.name);
  }

  return readonlyTextCell("-");
}
