package app.watchscout;

import android.os.Bundle;
import android.view.View;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Disable the overscroll glow effect at scroll boundaries
        this.bridge.getWebView().setOverScrollMode(View.OVER_SCROLL_NEVER);
    }
}
