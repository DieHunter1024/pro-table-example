import { GetRowKey } from 'antd/es/table/interface';
import React from 'react';
import type { ParamsType } from '@ant-design/pro-provider';
import type { ProColumns } from '../../';
import EditableProTable, { EditableProTableProps } from './index';

export function CellEditorTable<
  DataType extends Record<string, any>,
  Params extends ParamsType = ParamsType,
  ValueType = 'text',
>(props: EditableProTableProps<DataType, Params, ValueType>) {
  const [editableKeys, setEditableRowKeys] = React.useState<React.Key[]>([]);
  const [dataIndex, setDataIndex] = React.useState<any[]>([]);
  const { onBlur } = props
  const rowKey = props.rowKey || 'id';

  // ============================ RowKey ============================
  const getRowKey = React.useMemo<GetRowKey<any>>(() => {
    if (typeof rowKey === 'function') {
      return rowKey;
    }
    return (record: DataType, index?: number) => {
      if (index === -1) {
        return (record as any)?.[rowKey as string];
      }
      // 如果 props 中有name 的话，用index 来做行号，这样方便转化为 index
      if (props.name) {
        return index?.toString();
      }
      return (record as any)?.[rowKey as string] ?? index?.toString();
    };
  }, [props.name, rowKey]);
  return (
    <EditableProTable
      bordered
      pagination={false}
      {...props}
      editable={{
        editableKeys,
        ...props.editable,
      }}
      columns={
        (props?.columns?.map((item) => {
          return {

            editable:
              dataIndex.flat(1).join('.') ===
                [item.dataIndex || item.key].flat(1).join('.')
                ? undefined
                : false,
            onCell: (record: any, rowIndex: any) => {
              const cell = item.onCell?.(record, rowIndex);
              return {
                onDoubleClick: () => {
                  setEditableRowKeys([getRowKey(record, rowIndex)]);
                  setDataIndex([item.dataIndex || (item.key as string)]);
                },
                onBlur: () => {
                  onBlur?.(editableKeys, dataIndex)
                  setEditableRowKeys([]);
                },
                ...cell
              };
            },
            ...item,
          };
        }) as ProColumns<any, ValueType>[]) || []
      }
    />
  );
}