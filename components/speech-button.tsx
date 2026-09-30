type SpeechButtonProps = {
  children: string;
  disabled?: boolean;
  onClick: () => void;
};

export function SpeechButton({ children, disabled, onClick }: SpeechButtonProps) {
  return (
    <button className="speech-button" type="button" disabled={disabled} onClick={onClick}>
      <span aria-hidden="true">🔊</span> {children}
    </button>
  );
}
