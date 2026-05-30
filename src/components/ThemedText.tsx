import React from 'react';
import { Text, TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  type?: 'title' | 'subtitle' | 'tiptitle' | 'body' | 'link' | '';
  bold?: boolean,
  className?: string;
};

export function ThemedText({ type = 'body', bold = true, className = '', ...props }: ThemedTextProps) {

  // Base styles based on type
  let typeStyles = '';
  switch (type) {
    case 'title':
      typeStyles = `text-base ${bold ? 'font-bold' : ''}`;
      break;
    case 'subtitle':
      typeStyles = 'text-sm';
      break;
    case 'tiptitle':
      typeStyles = 'text-xs';
      break;
    case 'link':
      typeStyles = 'text-sm underline';
      break;
    default:
      typeStyles = 'text-sm';
  }


  // Combine all classes
  const combinedClassName = `${className} ${typeStyles}`;

  return <Text className={combinedClassName} {...props} />;
}
