import { IExercise } from '@/api/interface';
import clsx from 'clsx';
import { FC, Ref, useContext, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import {
  FormInstance,
  ModalProps,
  SzCheckboxObj as SzCheckbox,
  SzFormObj as SzForm,
  SzInputObj as SzInput,
  SzModal,
  SzSelect,
  message,
} from 'sz-components';
import { ExerciseManageUtils } from '../../utils';
import { ScorePointContent } from './score-point';

export type ScorePointEditableProps = {
  className?: string;
  initialValue?: IExercise.ScorePoint;
  formRef: Ref<unknown>;
  onFinish?: (value: IExercise.ScorePoint) => void;
};

const { FormatMapToObjList, FormatToOptions, filterMatchModeDetailOpts } = ExerciseManageUtils;
export const ScorePointEditable: FC<ScorePointEditableProps> = props => {
  const { className, initialValue, formRef, onFinish } = props;
  const { exerciseType } = useContext<any>(ScorePointContent);
  const isShort = exerciseType === IExercise.Enum.Question.short;
  const isBlank = exerciseType === IExercise.Enum.Question.blank;
  const [form] = SzForm.useForm<IExercise.ScorePoint>();
  useImperativeHandle(formRef, () => form);
  const matchMode: IExercise.Enum.MatchingMethod = SzForm.useWatch('matchMode', form);
  // 表单联动，默认选中匹配规则
  const matchModeChange = (value: IExercise.Enum.MatchingMethod) => {
    const opts = ExerciseManageUtils.matchModeDetailOpts(value, exerciseType);
    form.setFieldValue('matchMode', value);
    form.setFieldValue(
      'matchModeDetail',
      opts.map(i => i.value),
    );
  };
  const matchModeDetailOpts = useMemo(() => {
    const opts = filterMatchModeDetailOpts(ExerciseManageUtils.matchModeDetailOpts(matchMode, exerciseType));
    return opts;
  }, [matchMode]);

  const initValue = useMemo(() => {
    return {
      ...initialValue,
    };
  }, [initialValue]);
  return (
    <SzForm
      name="score-point-editable"
      form={form}
      className={clsx(className, 'score-point-editable')}
      onFinish={onFinish}
      initialValues={initValue}
    >
      <SzForm.Item label={`标签`} rules={[{ required: true, message: `请输入标签` }]} name="pointName">
        <SzInput maxLength={10} showCount />
      </SzForm.Item>
      <SzForm.Item label={`匹配内容`} name="matchValue" rules={[{ required: true, message: `请输入匹配内容` }]}>
        <SzInput.TextArea rows={1} showCount maxLength={1000} />
      </SzForm.Item>
      <SzForm.Item label="匹配目标" rules={[{ required: true, message: `请选择匹配目标` }]} name="matchObject">
        <SzSelect
          disabled={isShort || isBlank}
          options={ExerciseManageUtils.matchingTargetsOpts(exerciseType, IExercise.Enum.MatchingTargetsMapLabel).map(it => ({
            value: Number(it.key),
            label: it.value,
          }))}
        />
      </SzForm.Item>
      <SzForm.Item rules={[{ required: true, message: `请选择匹配方式` }]} label="匹配方式" name="matchMode">
        <SzSelect options={FormatToOptions(FormatMapToObjList(IExercise.Enum.MatchingMethodMap))} onChange={matchModeChange} />
      </SzForm.Item>
      <SzForm.Item label="附加规则" name="matchModeDetail">
        <SzCheckbox.Group options={matchModeDetailOpts} />
      </SzForm.Item>
      <SzForm.Item label={`备注说明`} name="note">
        <SzInput.TextArea rows={1} showCount maxLength={1000} />
      </SzForm.Item>
    </SzForm>
  );
};

export type ScorePointEditableModalProps = {
  initialValue?: IExercise.ScorePoint;
  value?: IExercise.ScorePoint[];
} & ModalProps;
export const ScorePointEditableModal: FC<ScorePointEditableModalProps> = props => {
  const { initialValue, onOk, onCancel, value, open, ...rest } = props;
  const { otherPoint } = useContext<any>(ScorePointContent);
  const formRef = useRef<FormInstance>();
  const onFinish = (data: any) => {
    const hasName = [otherPoint as IExercise.ScorePoint[], value].filter(it =>
      it?.find(item => item.pointName.trim() === data.pointName.trim()),
    );
    const check = Validator.validatorPoint([...(otherPoint ?? []), ...(value ?? [])], data);
    if (check) {
      return message.error(check);
    }
    if (hasName?.length > 0) return message.error('已存在该名称');
    onOk?.({ ...data });
  };
  const handleSubmit = () => {
    formRef.current?.submit();
  };
  const handleCancel = (e: any) => {
    onCancel?.(e);
  };
  return (
    <SzModal width={800} onOk={handleSubmit} destroyOnClose onCancel={handleCancel} open={open} {...rest}>
      <ScorePointEditable initialValue={initialValue} formRef={formRef} onFinish={onFinish} />
    </SzModal>
  );
};

class Validator {
  static validatorPoint = (point: IExercise.ScorePoint[], target: IExercise.ScorePoint) => {
    const result = point?.find(item => {
      const matchModeDetail = item.matchModeDetail as IExercise.Enum.ScoreRuleDetail[];
      return (
        item.matchValue.trim() === target.matchValue.trim() &&
        item.matchObject === target.matchObject &&
        item.matchMode === target.matchMode &&
        matchModeDetail.every(it => {
          return target.matchModeDetail.includes(it);
        })
      );
    });
    if (result) {
      return `内容和匹配规则与其他得/失分点完全相同，请修改后保存`;
    }
  };
}
