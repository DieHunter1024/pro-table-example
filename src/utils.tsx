import { IExercise } from '@/api/interface';
import { FormInstance } from 'sz-components';

export class ExerciseManageUtils {
  static FormatMapToObjList<T extends string | number | symbol>(map: Record<T, any>) {
    return Reflect.ownKeys(map).map(key => {
      const k = key as unknown as T;
      return {
        key,
        value: map[k],
      };
    });
  }
  static FormatToOptions = (
    list: {
      key: string | symbol;
      value: any;
    }[],
    type: 'string' | 'number' = 'number',
  ) =>
    list.map(it => ({
      value: type === 'number' && !isNaN(Number(it.key)) ? Number(it.key) : it.key.toString(),
      label: it.value,
    }));
  // 作答配置opts
  static getAnswerMethod(type: IExercise.Enum.Question, opts: typeof IExercise.Enum.AnsweringMethodMap) {
    return this.FormatMapToObjList(opts).filter(it => {
      const { singleChoice, multipleChoice, check, short, operate, blank } = IExercise.Enum.Question;
      const { select, text, flag, content } = IExercise.Enum.AnsweringMethod;
      const k = it.key as unknown as IExercise.Enum.AnsweringMethod;
      switch (type) {
        case singleChoice:
        case multipleChoice:
        case check:
          return [select].includes(k);
        case short:
          return [text].includes(k);
        case operate:
          return [text, flag].includes(k);
        case blank:
          return [content].includes(k);
      }
    });
  }

  // 判分规则opts
  static getAnswerAddMode(type: IExercise.Enum.Question, opts: typeof IExercise.Enum.ScoringRulesMap) {
    return this.FormatMapToObjList(opts).filter(it => {
      const { singleChoice, multipleChoice, check, short, operate, blank } = IExercise.Enum.Question;
      const { select, congruent, pointMode, text } = IExercise.Enum.ScoringRules;
      const k = Number(it.key) as unknown as IExercise.Enum.ScoringRules;
      switch (type) {
        case singleChoice:
        case multipleChoice:
        case check:
          return [select].includes(k);
        case short:
        case operate:
          return [congruent, pointMode].includes(k);
        case blank:
          return [text, pointMode].includes(k);
      }
    });
  }

  // 附加匹配规则opts
  static matchModeDetailOpts(
    matchMode: IExercise.Enum.MatchingMethod,
    type: IExercise.Enum.Question = IExercise.Enum.Question.singleChoice,
  ) {
    const { pre, post, transform, format, chinese } = IExercise.Enum.ScoreRuleDetail;
    return this.FormatToOptions(
      this.FormatMapToObjList(IExercise.Enum.ScoreRuleDetailMap).filter(it => {
        const key = it.key;
        if (Number(matchMode) === IExercise.Enum.MatchingMethod.include) {
          if (type === IExercise.Enum.Question.blank) {
            return [transform, chinese].includes(key as any);
          }
          return [transform, format, chinese].includes(key as any);
        }
        if (type === IExercise.Enum.Question.blank) {
          return [pre, post, transform, chinese].includes(key as any);
        }
        return [pre, post, transform, format, chinese].includes(key as any);
      }),
      'string',
    );
  }
  // 过滤附加匹配规则
  static filterMatchModeDetailOpts = (
    matchModeDetail: {
      value: string | number;
      label: any;
    }[],
  ) => {
    return matchModeDetail.map(it => {
      if (it.value === IExercise.Enum.ScoreRuleDetail.format) {
        return { ...it, disabled: true };
      }
      return it;
    });
  };
  // 匹配目标opts
  static matchingTargetsOpts(
    type: IExercise.Enum.Question = IExercise.Enum.Question.singleChoice,
    opts: typeof IExercise.Enum.MatchingTargetsMapLabel,
  ) {
    return this.FormatMapToObjList(opts).filter(it => {
      const { short, operate, blank } = IExercise.Enum.Question;
      const { text, flag, blank: matchBlank } = IExercise.Enum.MatchingTargets;
      const k = Number(it.key) as unknown as IExercise.Enum.MatchingTargets;
      switch (type) {
        case short:
        case operate:
          return [text, flag].includes(k);
        case blank:
          return [matchBlank].includes(k);
      }
    });
  }
  //判分模式opts
  static scoreModeOpts(type: IExercise.Enum.Question, opts: typeof IExercise.Enum.ScoringModeMap) {
    return this.FormatMapToObjList(opts).filter(it => {
      const { singleChoice, multipleChoice, check, short, operate, blank } = IExercise.Enum.Question;
      const { auto, manual } = IExercise.Enum.ScoringMode;
      const k = Number(it.key) as unknown as IExercise.Enum.ScoringMode;
      switch (type) {
        case singleChoice:
        case multipleChoice:
        case check:
          return [auto].includes(k);
        case short:
        case operate:
        case blank:
          return [auto, manual].includes(k);
      }
    });
  }
  //匹配范围opts
  static scoreRuleMatchOpts(
    type: IExercise.Enum.Question,
    opts: typeof IExercise.Enum.MatchingTargetsMap,
    answeringMethod: IExercise.Enum.AnsweringMethod[],
  ) {
    return this.FormatMapToObjList(opts).filter(it => {
      const { singleChoice, multipleChoice, check, short, operate } = IExercise.Enum.Question;
      const { text, flag } = IExercise.Enum.MatchingTargets;
      const k = Number(it.key) as unknown as IExercise.Enum.MatchingTargets;
      switch (type) {
        case singleChoice:
        case multipleChoice:
        case check:
          return false;
        case short:
          return [text].includes(k);
        case operate:
          return answeringMethod.map(it => Number(it) - 2).includes(k);
      }
    });
  }
  static arrayToObject(list: any[], keyType: 'string' | 'number' = 'number') {
    return list.reduce((acc, cur, index) => {
      const key = keyType === 'string' ? index.toString() : index;
      acc[key] = cur;
      return acc;
    }, {});
  }
}

export class ExerciseValidator {
  static optionList =
    (form: FormInstance) =>
    (rule: any, value: string): Promise<any> => {
      if (!value) {
        return Promise.reject(new Error('请输入选项文案'));
      }
      const optionList: { id: string; originId: string; content: string }[] = form.getFieldValue('optionList');
      if (optionList.filter(it => it.content?.trim?.() === value?.trim?.())?.length > 1) {
        return Promise.reject('试题选项存在重复文案');
      }
      return Promise.resolve();
    };

  static answer =
    (form: FormInstance) =>
    (rule: any, value: string[]): Promise<any> => {
      if (!value) {
        return Promise.resolve();
      }
      const type: IExercise.Enum.Question = form.getFieldValue('type');

      switch (type) {
        case IExercise.Enum.Question.multipleChoice: {
          if (value.length < 1) {
            return Promise.reject('多选题答案至少选择一个');
          }
          break;
        }
        case IExercise.Enum.Question.short:
        case IExercise.Enum.Question.operate: {
          if (value.length > 500) {
            return Promise.resolve('答案不能超过 500 个字');
          }
          break;
        }
      }

      return Promise.resolve();
    };
}
