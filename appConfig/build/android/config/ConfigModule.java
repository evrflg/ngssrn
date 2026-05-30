package com.ng.app.ngrn.config;

import android.content.Context;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import java.util.HashMap;
import java.util.Map;

public class ConfigModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public ConfigModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "DomainModule";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("domain_url", DomainModule.getDomain(reactContext));
        return constants;
    }
}
