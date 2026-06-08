import React from 'react';

function getErrorMessage(errorCode) {
  if (errorCode === 'invalid') return 'Invalid username or password.';
  return '';
}

function CoverCaseStack({ covers = [] }) {
  const visibleCovers = covers
    .filter((cover) => cover?.coverUrl)
    .slice(0, 4);

  const displayCovers = visibleCovers.length
    ? visibleCovers
    : [
      { id: 'fallback-1', fallback: true },
      { id: 'fallback-2', fallback: true },
      { id: 'fallback-3', fallback: true },
    ];

  const transforms = [
    'translateX(-120px) rotate(-10deg)',
    'translateX(-42px) translateY(-10px) rotate(-3deg)',
    'translateX(42px) translateY(-8px) rotate(4deg)',
    'translateX(120px) rotate(11deg)',
  ];

  return (
    <div className="tw-relative tw-mx-auto tw-h-[164px] tw-w-full tw-max-w-[430px] tw-overflow-visible" aria-hidden="true">
      <div className="tw-absolute tw-inset-x-0 tw-bottom-0 tw-h-20 tw-rounded-full tw-bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] tw-blur-3xl" />
      {displayCovers.map((cover, index) => (
        <div
          key={`${cover.coverUrl || cover.id || 'cover'}-${index}`}
          className="login-cover-case tw-absolute tw-left-1/2 tw-top-3 tw-h-[128px] tw-w-[128px] tw-origin-bottom tw-rounded-[22px] tw-border tw-border-[color-mix(in_srgb,var(--text)_16%,transparent)] tw-bg-[color-mix(in_srgb,var(--surface)_72%,transparent)] tw-p-2 tw-shadow-[0_28px_70px_rgba(0,0,0,0.28)] tw-backdrop-blur-xl"
          style={{
            transform: `translateX(-50%) ${transforms[index] || ''}`,
            zIndex: 10 + index,
          }}
        >
          <div className="tw-absolute tw-right-[-20px] tw-top-1/2 tw-h-20 tw-w-20 -tw-translate-y-1/2 tw-rounded-full tw-border tw-border-[rgba(255,255,255,0.42)] tw-bg-[radial-gradient(circle_at_center,transparent_0_13px,color-mix(in_srgb,var(--text)_16%,transparent)_14px_16px,rgba(255,255,255,0.46)_17px_24px,rgba(255,255,255,0.16)_25px_100%)] tw-shadow-[inset_0_0_28px_rgba(255,255,255,0.28)]" />
          {cover.coverUrl ? (
            <img
              className="tw-relative tw-z-10 tw-h-full tw-w-full tw-rounded-[16px] tw-object-cover tw-shadow-[0_10px_28px_rgba(0,0,0,0.28)]"
              src={cover.coverUrl}
              alt=""
              loading="lazy"
            />
          ) : (
            <div className="tw-relative tw-z-10 tw-grid tw-h-full tw-w-full tw-place-items-center tw-rounded-[16px] tw-bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.72)_0_18%,color-mix(in_srgb,var(--accent)_24%,transparent)_19%_38%,color-mix(in_srgb,var(--surface)_78%,transparent)_39%_100%)] tw-shadow-[0_10px_28px_rgba(0,0,0,0.2)]">
              <i className="fa-solid fa-compact-disc tw-text-[2.45rem] tw-text-[color-mix(in_srgb,var(--text)_58%,transparent)]" aria-hidden="true" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function LoginView({
  title = 'Monochrome-Streamer',
  currentUser = null,
  nextPath = '/',
  errorCode = '',
  ambientCoverUrl = '',
  ambientTitle = '',
  ambientArtist = '',
  ambientCovers = [],
}) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isGuestSession = currentUser?.authDisabled === true;
  const isSignedInUser = currentUser && !isGuestSession;
  const errorMessage = getErrorMessage(errorCode);
  const accentGradient = 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 88%, #7c3aed) 0%, color-mix(in srgb, var(--accent) 62%, #1fb6ff) 100%)';
  const coverStack = [
    ...ambientCovers,
    ambientCoverUrl ? { coverUrl: ambientCoverUrl, title: ambientTitle, artist: ambientArtist } : null,
  ].filter((cover, index, list) => cover?.coverUrl && list.findIndex((item) => item?.coverUrl === cover.coverUrl) === index);

  return (
    <section className="tw-grid tw-min-h-screen tw-place-items-center tw-px-5 tw-py-8 sm:tw-px-8">
      <div className="tw-relative tw-w-full tw-max-w-[540px] tw-overflow-hidden tw-rounded-[38px] tw-border tw-border-[color-mix(in_srgb,var(--text)_12%,transparent)] tw-bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] tw-shadow-[0_38px_120px_rgba(0,0,0,0.42)] tw-backdrop-blur-[26px]">
        <div className="tw-pointer-events-none tw-absolute tw-inset-x-10 tw-top-[-18%] tw-h-44 tw-rounded-full tw-blur-3xl" style={{ background: 'color-mix(in srgb, var(--accent) 30%, transparent)' }} />
        <div className="tw-pointer-events-none tw-absolute tw-bottom-[-18%] tw-right-[-8%] tw-h-48 tw-w-48 tw-rounded-full tw-blur-3xl" style={{ background: 'color-mix(in srgb, var(--accent) 20%, #35b5ff 20%, transparent)' }} />

        <div className="tw-relative tw-grid tw-gap-6 tw-px-7 tw-py-8 sm:tw-gap-7 sm:tw-px-10 sm:tw-py-10">
          <div className="tw-grid tw-gap-4 tw-text-center">
            <CoverCaseStack covers={coverStack} />
            <div className="tw-grid tw-gap-2">
              <p className="eyebrow tw-m-0 tw-text-center tw-text-[0.82rem] tw-text-[color:var(--muted)]">
                {title}
              </p>
              <h1 className="tw-m-0 tw-font-display tw-text-[clamp(2.35rem,6vw,3.3rem)] tw-leading-[0.98] tw-tracking-[-0.05em] tw-text-text">
                Welcome back
              </h1>
              <p className="tw-m-0 tw-text-[1rem] tw-leading-relaxed tw-text-muted">
                Log in to your account to continue.
              </p>
            </div>
          </div>

          {isGuestSession ? (
            <div className="tw-rounded-[24px] tw-border tw-border-[color-mix(in_srgb,var(--text)_10%,transparent)] tw-bg-[color-mix(in_srgb,var(--glass)_80%,transparent)] tw-p-4 tw-text-[0.96rem] tw-leading-relaxed tw-text-muted">
              Anonymous browsing is enabled. Sign in here only if you need a user or admin session.
            </div>
          ) : null}

          {isSignedInUser ? (
            <div className="tw-grid tw-gap-3 tw-rounded-[24px] tw-border tw-border-[color-mix(in_srgb,var(--text)_10%,transparent)] tw-bg-[color-mix(in_srgb,var(--glass)_80%,transparent)] tw-p-4">
              <p className="tw-m-0 tw-text-[0.96rem] tw-leading-relaxed tw-text-muted">
                Currently signed in as <strong className="tw-text-text">{currentUser.username}</strong>. Sign in below to switch accounts, or keep using your current session.
              </p>
              <div className="tw-flex tw-flex-wrap tw-justify-center tw-gap-3">
                <a className="secondary-button tw-min-w-[150px] tw-justify-center" href="/">
                  Open app
                </a>
                <a className="secondary-button tw-min-w-[150px] tw-justify-center" href="/logout">
                  Logout
                </a>
              </div>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="tw-rounded-[22px] tw-border tw-border-[color-mix(in_srgb,var(--favorite-red)_56%,transparent)] tw-bg-[color-mix(in_srgb,var(--favorite-red)_14%,transparent)] tw-p-4 tw-text-[0.95rem] tw-font-bold tw-text-text">
              {errorMessage}
            </div>
          ) : null}

          <form className="tw-grid tw-gap-4" method="post" action="/login">
            <input type="hidden" name="next" value={nextPath || '/'} />

            <label className="tw-grid tw-gap-2.5">
              <span className="eyebrow tw-text-text">Username</span>
              <input
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                placeholder="admin"
                className="tw-h-[62px] tw-rounded-[999px] tw-border tw-border-[color-mix(in_srgb,var(--text)_10%,transparent)] tw-bg-[color-mix(in_srgb,var(--surface)_74%,transparent)] tw-px-5 tw-text-[1.05rem] tw-font-semibold tw-text-text tw-shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] tw-outline-none tw-backdrop-blur-xl focus:tw-border-accent focus:tw-shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_18%,transparent)]"
              />
            </label>

            <label className="tw-grid tw-gap-2.5">
              <span className="eyebrow tw-text-text">Password</span>
              <div className="tw-relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="tw-h-[62px] tw-w-full tw-rounded-[999px] tw-border tw-border-[color-mix(in_srgb,var(--text)_10%,transparent)] tw-bg-[color-mix(in_srgb,var(--surface)_74%,transparent)] tw-pl-5 tw-pr-28 tw-text-[1.05rem] tw-font-semibold tw-text-text tw-shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] tw-outline-none tw-backdrop-blur-xl focus:tw-border-accent focus:tw-shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_18%,transparent)]"
                />
                <button
                  type="button"
                  className="tw-absolute tw-inset-y-2 tw-right-2 tw-inline-flex tw-min-w-[88px] tw-items-center tw-justify-center tw-gap-2 tw-rounded-full tw-border tw-border-[color-mix(in_srgb,var(--text)_10%,transparent)] tw-bg-[color-mix(in_srgb,var(--glass)_86%,transparent)] tw-px-4 tw-text-[0.9rem] tw-font-bold tw-text-muted tw-transition hover:tw-border-accent hover:tw-text-text"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                </button>
              </div>
            </label>

            <button
              className="tw-mt-2 tw-inline-flex tw-min-h-[64px] tw-items-center tw-justify-center tw-rounded-[999px] tw-border tw-border-[color-mix(in_srgb,var(--accent)_54%,transparent)] tw-px-6 tw-text-[1.08rem] tw-font-extrabold tw-text-white tw-shadow-[0_24px_60px_color-mix(in_srgb,var(--accent)_24%,transparent)] tw-transition hover:tw-translate-y-[-1px] hover:tw-shadow-[0_28px_70px_color-mix(in_srgb,var(--accent)_30%,transparent)]"
              style={{ background: accentGradient }}
              type="submit"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
