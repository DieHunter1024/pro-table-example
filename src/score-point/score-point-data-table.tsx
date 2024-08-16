import { DragSortTableProps } from '@/components/data-table/type';
import { IExercise } from '@/api/interface';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ProColumns, SzTypography, ProTable, SzConfigProvider, SzFormObj, SzForm, SzCheckbox } from 'sz-components';
import { DataTableUtils } from '@/utils/data-table.utils';
import { ScorePointContent } from './score-point';
import { DragSortCellEditorTable, DragSortProTable } from '@/components';
import { ExerciseManageUtils } from '../../utils';

export const ScorePointDataTable: React.FC<DragSortTableProps<IExercise.ScorePoint>> = props => {
  const { extraColumns, hideInTable, isDrag = true, ...rest } = props;
  const { baseName = '' } = useContext<any>(ScorePointContent);
  const TableElem: React.ComponentType<any> = isDrag ? DragSortProTable : ProTable;
  const columns = useMemo(() => {
    const cols: ProColumns<IExercise.ScorePoint>[] = [
      {
        key: 'pointName',
        dataIndex: 'pointName',
        title: `${baseName}标签`,
        width: 160,
      },
      {
        key: 'matchValue',
        dataIndex: 'matchValue',
        title: `匹配内容`,
        ellipsis: true,
        width: 120,
      },
      {
        key: 'matchObject',
        dataIndex: 'matchObject',
        title: '匹配目标',
        valueEnum: IExercise.Enum.MatchingTargetsMapLabel,
        width: 160,
      },
      {
        key: 'matchMode',
        dataIndex: 'matchMode',
        title: '匹配方式',
        valueEnum: IExercise.Enum.MatchingMethodMap,
        width: 120,
      },
      {
        key: 'matchModeDetail',
        dataIndex: 'matchModeDetail',
        title: '附加规则',
        width: 120,
        ellipsis: true,
        render: (_, record: IExercise.ScorePoint) => {
          const item = Reflect.ownKeys(IExercise.Enum.ScoreRuleDetailMap)
            .filter(k => (record?.matchModeDetail as IExercise.Enum.ScoreRuleDetail[])?.includes(k as any))
            .map(k => IExercise.Enum.ScoreRuleDetailMap[k as unknown as IExercise.Enum.ScoreRuleDetail])
            .join(', ');
          return <SzTypography.Text ellipsis={{ tooltip: true }}>{item ?? '-'}</SzTypography.Text>;
        },
      },
      {
        key: 'note',
        dataIndex: 'note',
        title: `备注说明`,
        ellipsis: true,
        width: 120,
      },
    ];

    return DataTableUtils.resolve(cols, {
      extraColumns,
      hideInTable,
    });
  }, [extraColumns, hideInTable, rest]);

  return (
    <SzConfigProvider renderEmpty={() => <div className="empty">暂无数据</div>}>
      <TableElem
        scroll={rest.scroll ?? { x: '100%', y: window.innerHeight * 0.6 }}
        columns={columns}
        rowKey="sort"
        search={false}
        pagination={false}
        dragSortKey="sort"
        {...rest}
      />
    </SzConfigProvider>
  );
};

const { FormatMapToObjList, FormatToOptions, filterMatchModeDetailOpts } = ExerciseManageUtils;

export const ScorePointEditTable: React.FC<DragSortTableProps<IExercise.ScorePoint>> = props => {
  const { extraColumns, hideInTable, isDrag = true, ...rest } = props;
  const { baseName = '', exerciseType } = useContext<any>(ScorePointContent);
  const isShort = exerciseType === IExercise.Enum.Question.short;
  const isBlank = exerciseType === IExercise.Enum.Question.blank;

  const TableElem: React.ComponentType<any> = isDrag ? DragSortCellEditorTable : ProTable;

  const columns = useMemo(() => {
    const cols: ProColumns<IExercise.ScorePoint>[] = [
      {
        key: 'pointName',
        dataIndex: 'pointName',
        title: `${baseName}标签`,
        width: 200,
        fieldProps: {
          maxLength: 10,
          showCount: true,
        },
        formItemProps: {
          rules: [{ required: true, message: `请输入标签` }],
        },
      },
      {
        key: 'matchValue',
        dataIndex: 'matchValue',
        title: `匹配内容`,
        ellipsis: true,
        fieldProps: {
          maxLength: 1000,
          showCount: true,
        },
        width: 200,
        formItemProps: {
          rules: [{ required: true, message: `请输入匹配内容` }],
        },
      },
      {
        key: 'matchObject',
        dataIndex: 'matchObject',
        title: '匹配目标',
        readonly: isShort || isBlank,
        valueType: 'select',
        fieldProps: {
          options: ExerciseManageUtils.matchingTargetsOpts(exerciseType, IExercise.Enum.MatchingTargetsMapLabel).map(it => ({
            value: Number(it.key),
            label: it.value,
          })),
        },
        valueEnum: IExercise.Enum.MatchingTargetsMapLabel,
        width: 200,
        formItemProps: {
          rules: [{ required: true, message: `请选择匹配目标` }],
        },
      },
      {
        key: 'matchMode',
        dataIndex: 'matchMode',
        title: '匹配方式',
        valueEnum: IExercise.Enum.MatchingMethodMap,
        width: 200,
        valueType: 'select',
        fieldProps: (_, record) => {
          return {
            options: FormatToOptions(FormatMapToObjList(IExercise.Enum.MatchingMethodMap)),
          };
        },
        formItemProps: {
          rules: [{ required: true, message: `请选择匹配方式` }],
        },
      },
      {
        key: 'matchModeDetail',
        dataIndex: 'matchModeDetail',
        title: '附加规则',
        width: 650,
        ellipsis: true,
        editable: false,
        render: (line, record: IExercise.ScorePoint, index: number) => {
          const opts = filterMatchModeDetailOpts(ExerciseManageUtils.matchModeDetailOpts(record.matchMode, exerciseType));
          const onChange = (val: any) => {
            rest?.handleChange?.(val, index, 'matchModeDetail');
          };
          return <SzCheckbox.Group options={opts} onChange={onChange} value={record.matchModeDetail as string[]} />;
        },
      },
      {
        key: 'note',
        dataIndex: 'note',
        title: `备注说明`,
        ellipsis: true,
        fieldProps: {
          maxLength: 1000,
          showCount: true,
        },
        width: 200,
      },
    ];

    return DataTableUtils.resolve(cols, {
      extraColumns,
      hideInTable,
    });
  }, [extraColumns, hideInTable, rest]);

  return (
    <SzConfigProvider renderEmpty={() => <div className="empty">暂无数据</div>}>
      <TableElem
        scroll={rest.scroll ?? { x: '100%', y: window.innerHeight * 0.6 }}
        columns={columns}
        rowKey="key"
        search={false}
        pagination={false}
        dragSortKey="sort"
        {...rest}
      />
    </SzConfigProvider>
  );
};
