import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Accessibility, Plus, Minus, RotateCcw, Type, Sun, Moon, Eye, Underline, MousePointer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibilityState {
  fontSize: number;
  highContrast: boolean;
  darkMode: boolean;
  underlineLinks: boolean;
  bigCursor: boolean;
  highlightFocus: boolean;
  lineHeight: number;
}

const defaultState: AccessibilityState = {
  fontSize: 100,
  highContrast: false,
  darkMode: false,
  underlineLinks: false,
  bigCursor: false,
  highlightFocus: false,
  lineHeight: 100,
};

const STORAGE_KEY = 'accessibility-settings';

const AccessibilityWidget = () => {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<AccessibilityState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch {
      return defaultState;
    }
  });

  const applySettings = useCallback((s: AccessibilityState) => {
    const root = document.documentElement;

    // Font size
    root.style.fontSize = `${s.fontSize}%`;

    // Line height
    if (s.lineHeight !== 100) {
      root.style.setProperty('--accessibility-line-height', `${s.lineHeight / 100 * 1.5}`);
      document.body.style.lineHeight = `${s.lineHeight / 100 * 1.5}`;
    } else {
      root.style.removeProperty('--accessibility-line-height');
      document.body.style.removeProperty('line-height');
    }

    // High contrast
    root.classList.toggle('high-contrast', s.highContrast);

    // Dark mode
    root.classList.toggle('dark', s.darkMode);

    // Underline links
    root.classList.toggle('underline-links', s.underlineLinks);

    // Big cursor
    root.classList.toggle('big-cursor', s.bigCursor);

    // Highlight focus
    root.classList.toggle('highlight-focus', s.highlightFocus);
  }, []);

  useEffect(() => {
    applySettings(state);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, applySettings]);

  const update = (partial: Partial<AccessibilityState>) => {
    setState(prev => ({ ...prev, ...partial }));
  };

  const reset = () => {
    setState(defaultState);
  };

  const increaseFontSize = () => {
    if (state.fontSize < 150) update({ fontSize: state.fontSize + 10 });
  };

  const decreaseFontSize = () => {
    if (state.fontSize > 80) update({ fontSize: state.fontSize - 10 });
  };

  const increaseLineHeight = () => {
    if (state.lineHeight < 200) update({ lineHeight: state.lineHeight + 25 });
  };

  const decreaseLineHeight = () => {
    if (state.lineHeight > 100) update({ lineHeight: state.lineHeight - 25 });
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
            aria-label="Opções de Acessibilidade"
            title="Acessibilidade"
          >
            <Accessibility className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="w-72 p-0"
          sideOffset={12}
        >
          <div className="border-b border-border bg-primary/5 px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Accessibility className="h-4 w-4" />
                Acessibilidade
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="h-7 text-xs"
                title="Restaurar padrão"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Resetar
              </Button>
            </div>
          </div>

          <div className="space-y-1 p-3">
            {/* Font Size */}
            <div className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted/50">
              <span className="flex items-center gap-2 text-sm">
                <Type className="h-4 w-4 text-muted-foreground" />
                Tamanho da Fonte
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={decreaseFontSize}
                  disabled={state.fontSize <= 80}
                  aria-label="Diminuir fonte"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-10 text-center text-xs font-medium">{state.fontSize}%</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={increaseFontSize}
                  disabled={state.fontSize >= 150}
                  aria-label="Aumentar fonte"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Line Height */}
            <div className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted/50">
              <span className="flex items-center gap-2 text-sm">
                <Type className="h-4 w-4 text-muted-foreground" />
                Espaçamento
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={decreaseLineHeight}
                  disabled={state.lineHeight <= 100}
                  aria-label="Diminuir espaçamento"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-10 text-center text-xs font-medium">{state.lineHeight}%</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={increaseLineHeight}
                  disabled={state.lineHeight >= 200}
                  aria-label="Aumentar espaçamento"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Toggle options */}
            <ToggleOption
              icon={<Eye className="h-4 w-4" />}
              label="Alto Contraste"
              active={state.highContrast}
              onClick={() => update({ highContrast: !state.highContrast })}
            />
            <ToggleOption
              icon={<Moon className="h-4 w-4" />}
              label="Modo Escuro"
              active={state.darkMode}
              onClick={() => update({ darkMode: !state.darkMode })}
            />
            <ToggleOption
              icon={<Underline className="h-4 w-4" />}
              label="Sublinhar Links"
              active={state.underlineLinks}
              onClick={() => update({ underlineLinks: !state.underlineLinks })}
            />
            <ToggleOption
              icon={<MousePointer className="h-4 w-4" />}
              label="Cursor Grande"
              active={state.bigCursor}
              onClick={() => update({ bigCursor: !state.bigCursor })}
            />
            <ToggleOption
              icon={<Sun className="h-4 w-4" />}
              label="Destaque de Foco"
              active={state.highlightFocus}
              onClick={() => update({ highlightFocus: !state.highlightFocus })}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

function ToggleOption({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors',
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-foreground hover:bg-muted/50'
      )}
      aria-pressed={active}
    >
      <span className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </span>
      <span
        className={cn(
          'h-5 w-9 rounded-full transition-colors relative',
          active ? 'bg-primary' : 'bg-muted-foreground/30'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
            active ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </span>
    </button>
  );
}

export default AccessibilityWidget;
