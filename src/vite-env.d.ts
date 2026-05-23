/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANALYTICS_ENDPOINT?: string;
  readonly VITE_TOSS_REAL_CLIENT?: string;
  readonly VITE_TOSS_REAL_EXTERNAL_REWARDS?: string;
  readonly VITE_TOSS_CONTACTS_VIRAL_MODULE_ID?: string;
  readonly VITE_TOSS_REWARDED_AD_RESULT_FAILURE_ID?: string;
  readonly VITE_TOSS_REWARDED_AD_RESULT_COMPLETION_ID?: string;
  readonly VITE_TOSS_REWARDED_AD_RECIPE_BOOK_ID?: string;
  readonly VITE_TOSS_PROMOTION_CODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
