package com.ng.app.ngrn.config;

import android.content.Context;

public class DomainModule {
    // 在构建时注入的 API 域名
    private static final String DOMAIN_URL = "https://ngss2test.ngss.bet";

    public static String getDomain(Context context) {
        return DOMAIN_URL;
    }
}
