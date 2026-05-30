/**
 * 滚动组件
 * @param notices 滚动内容
 * @param speed 滚动速度（像素每秒），默认60
 * @param containerStyle 容器样式
 */
import React from 'react';
import { Platform, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

interface BaseMarqueeProps {
  notices: string;
  speed?: number;
  containerStyle?: ViewStyle;
}

const BaseMarquee: React.FC<BaseMarqueeProps> = ({
  notices,
  speed = 60,
  containerStyle,
}) => {
  const parseHtml = (inputContent: string) => {
    const outputContent = inputContent
      .replaceAll('<br/>', '')
      .replaceAll('<br>', '')
      .replaceAll('<br />', '')
      .replaceAll('\n', '')

    return outputContent
  };

  // 生成HTML内容
  const generateHTML = () => {
    const parsedHtml = parseHtml(notices)

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          .marquee-container {
            width: 100%;
            height: 30px;
            overflow: hidden;
            position: relative;
            background: transparent;
          }
          
          .marquee-content {
            position: absolute;
            top: 0;
            left: 100%;
            height: 30px;
            line-height: 30px;
            white-space: nowrap;
            display: flex;
            align-items: center;
            animation: marquee-scroll linear infinite;
          }
          
          .marquee-content * {
            display: inline-block !important;
            white-space: nowrap !important;
            line-height: 30px !important;
            height: 30px !important;
            vertical-align: middle !important;
            text-wrap: nowrap !important;
          }
          
          @keyframes marquee-scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-100% - 100vw));
            }
          }
        </style>
      </head>
      <body style="background: transparent;">
        <div class="marquee-container">
          <div class="marquee-content" id="marqueeContent">
            ${parsedHtml}
          </div>
        </div>
        
        <script>
          let timeoutId = null;
          let hasStarted = false;
          
          function startMarquee() {
            if (hasStarted) return;
            hasStarted = true;
            
            const content = document.getElementById('marqueeContent');
            const container = document.querySelector('.marquee-container');
            
            if (content && container) {
              const contentWidth = content.scrollWidth;
              const containerWidth = container.offsetWidth;
              const totalDistance = contentWidth + containerWidth;
              const duration = totalDistance / ${speed};
              
              content.style.animationDuration = duration + 's';
            }
          }
          
          function cleanup() {
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            
            // 移除事件监听器
            document.removeEventListener('DOMContentLoaded', startMarquee);
            window.removeEventListener('beforeunload', cleanup);
          }
          
          // 页面卸载时清理
          window.addEventListener('beforeunload', cleanup);
          
          // DOM加载完成后启动
          document.addEventListener('DOMContentLoaded', startMarquee);
          
          // 备用延迟启动
          timeoutId = setTimeout(() => {
            if (!hasStarted) {
              startMarquee();
            }
          }, 200);
        </script>
      </body>
      </html>
    `;
  };

  // web 使用 iframe
  if (Platform.OS === 'web') {
    return (
      <View style={[{ height: 30, width: '100%' }, containerStyle]}>
        <iframe
          srcDoc={generateHTML()}
          style={{
            width: '100%',
            height: 30,
            border: 'none',
            background: 'transparent',
          }}
        />
      </View>
    );
  }

  // app 使用 webView
  return (
    <View style={[{ height: 30, width: '100%' }, containerStyle]}>
      <WebView
        source={{ html: generateHTML() }}
        style={{ height: 30, backgroundColor: 'transparent' }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled={true}
        onShouldStartLoadWithRequest={() => true}
        originWhitelist={['*']}
        renderLoading={() => <View style={{ height: 30, backgroundColor: 'transparent' }} />}
        startInLoadingState={false}
      />
    </View>
  );
};

export default BaseMarquee; 