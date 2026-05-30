import { Trans, useTranslation } from 'react-i18next';
import { ThemedText, type ThemedTextProps } from './ThemedText';
import { isEmptyObject} from '@/utils/is'

export interface I18nTextProps extends Omit<ThemedTextProps, 'children'> {
  i18nKey: string;
  values?: Record<string, any>;
  needTrans?: boolean,
  transComponents?: {},
}

export function I18nText({ i18nKey, values, needTrans = false, transComponents = {}, ...rest }: I18nTextProps) {
  const { t } = useTranslation();

  return (
    isEmptyObject(transComponents) ? 
      <ThemedText {...rest}>
        {t(i18nKey, values)}
      </ThemedText> :
      <ThemedText {...rest}>
        <Trans
          i18nKey={i18nKey}
          values={values}
          components={transComponents}
        />
      </ThemedText>
  );
} 