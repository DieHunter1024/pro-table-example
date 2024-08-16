import { ActionType, EditableFormInstance, message, SzButton, SzForm, SzFormObj, SzPopconfirm } from 'sz-components';
import { ScorePointEditTable } from './score-point-data-table';
import React, { FC, useMemo, useState, createContext, useRef, Key, useCallback } from 'react';
import { IExercise } from '@/api/interface';
import { ScorePointEditableModal } from './score-point-editable';
import { ExerciseManageUtils } from '../../utils';
import { DeleteOutlined, FormOutlined } from '@ant-design/icons';
import { NamePath } from 'antd/es/form/interface';
const createScorePoint = (list?: unknown[], str = IExercise.Enum.PointModeMap[IExercise.Enum.PointMode.score]) => ({
  pointName: `${str}${(list?.length ?? 0) + 1}`,
});
export type ScorePointProps = {
  value?: IExercise.ScorePoint[];
  // name: (string | number)[];
  // preName?: (string | number)[]
  type?: IExercise.Enum.PointMode;
  exerciseType?: IExercise.Enum.Question;
  otherPointKey: NamePath;
  onChange?: (data: IExercise.ScorePoint[]) => void;
};
export const ScorePointContent = createContext({});
// 过滤除自己外的列表
export const filterOtherByKey = (
  list: IExercise.ScorePoint[],
  item: IExercise.ScorePoint,
  key: keyof IExercise.ScorePoint = 'pointName',
) => {
  return list.filter(v => v[key] !== item[key]);
};

// 自增排序
export const upSortByKey = (list: IExercise.ScorePoint[], key: keyof IExercise.ScorePoint = 'sort') => {
  if (!list?.length) return 0;
  const max = Math.max(...list.map(v => Number(v[key])));
  return max + 1;
};
export const ScorePoint: FC<ScorePointProps> = props => {
  const {
    // name, preName = [],
    value = [],
    onChange,
    type = IExercise.Enum.PointMode.score,
    exerciseType = IExercise.Enum.Question.short,
    otherPointKey,
  } = props;
  // const allName = preName?.concat(name)// 防止表单数据不在第一层
  const form = SzFormObj.useFormInstance();
  const otherPoint = form.getFieldValue(otherPointKey);
  // const scorePoint: IExercise.ScorePoint[] = SzForm.useWatch(name, form);
  const editableFormRef = useRef<EditableFormInstance>();
  const scorePointValue = useMemo(() => {
    return {
      baseName: IExercise.Enum.PointModeMap[type],
      exerciseType,
      otherPoint,
    };
  }, [type, exerciseType, otherPoint]);
  const isShort = exerciseType === IExercise.Enum.Question.short;
  const isBlank = exerciseType === IExercise.Enum.Question.blank;
  // 默认值
  const scorePointDefault = useCallback(() => {
    const matchMode = IExercise.Enum.MatchingMethod.include;
    let matchObject;
    if (isShort) {
      matchObject = IExercise.Enum.MatchingTargets.text;
    } else if (isBlank) {
      matchObject = IExercise.Enum.MatchingTargets.blank;
    }
    return {
      ...createScorePoint(value, scorePointValue.baseName),
      matchObject,
      matchMode,
      matchModeDetail: ExerciseManageUtils.matchModeDetailOpts(matchMode, exerciseType).map(i => i.value),
    };
  }, [scorePointValue, isShort, form, value]);
  const handleDragSortEnd = (newDataSource: any) => {
    onChange?.(newDataSource);
  };
  const addScorePoint = () => {
    if (value.length >= 10) return message.error(`最多添加10个${scorePointValue.baseName}`);
    onChange?.([...value, { ...scorePointDefault(), sort: upSortByKey(value) ?? 0 } as any]);
  };

  const handleDelete = (item: IExercise.ScorePoint) => {
    onChange?.(filterOtherByKey(value, item));
  };
  // 表单联动，默认选中匹配规则
  const matchModeChange = (matchMode: IExercise.Enum.MatchingMethod, prevMatchMode: IExercise.Enum.MatchingMethod) => {
    if (!prevMatchMode || !matchMode || matchMode === prevMatchMode) return {};
    const opts = ExerciseManageUtils.matchModeDetailOpts(matchMode, exerciseType);
    return { matchModeDetail: opts.map(i => i.value) };
  };
  const handleBlur = (editableKeys: Key[], dataIndex: any[]) => {
    const index = editableKeys[0] as number;
    const line = editableFormRef?.current?.getRowData?.(index);
    const item = value[index];
    const other = matchModeChange(line?.matchMode, item.matchMode);
    if (!line || !other) return;
    value[index] = Object.assign(value[index], line, other);
    onChange?.([...value]);
  };
  const handleChange = (data: any, index: number, key: keyof IExercise.ScorePoint) => {
    const item = value?.[index];
    if (item) {
      (item[key] as any) = data;
      onChange?.([...value]);
    }
  };
  const extraColumns = useMemo<any>(() => {
    return [
      {
        title: '操作',
        width: 120,
        fixed: 'right',
        editable: false, // 设置此列为不可编辑
        render(text: unknown, item: IExercise.ScorePoint, _: unknown, action: any) {
          return (
            <>
              <SzPopconfirm title={`是否删除${item?.pointName}?`} cancelText="取消" okText="确定" onConfirm={() => handleDelete(item)}>
                <SzButton icon={<DeleteOutlined />} type="link" danger />
              </SzPopconfirm>
            </>
          );
        },
      },
    ];
  }, [value]);

  return (
    <ScorePointContent.Provider value={scorePointValue}>
      {
        <div className="score-point">
          <SzButton onClick={addScorePoint}>{`添加${scorePointValue.baseName}`}</SzButton>
          <ScorePointEditTable
            rowKey="key"
            value={value}
            recordCreatorProps={false}
            extraColumns={extraColumns}
            search={false}
            tooltip={false}
            pagination={false}
            onDragSortEnd={handleDragSortEnd}
            className="hideRefresh"
            dataSource={value}
            editableFormRef={editableFormRef}
            onBlur={handleBlur}
            handleChange={handleChange}
          />
        </div>
      }
    </ScorePointContent.Provider>
  );
};
