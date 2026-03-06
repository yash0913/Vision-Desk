; Custom NSIS script for DeskLink installer
; This ensures proper installation behavior

; Macro for custom installer pages
!macro customInstall
  ; Create logs directory for agent
  CreateDirectory "$APPDATA\DeskLinkAgent\logs"
  
  ; Display installation complete message
  MessageBox MB_OK "DeskLink has been installed successfully.$\r$\n$\r$\nThe DeskLink Agent will start automatically when you run the application.$\r$\n$\r$\nYou can manage the agent from the system tray icon."
!macroend

; Macro for custom uninstaller behavior
!macro customUnInstall
  ; Clean up agent logs (optional - comment out if you want to preserve logs)
  ; RMDir /r "$APPDATA\DeskLinkAgent"
  
  MessageBox MB_YESNO "Do you want to remove DeskLink Agent logs?" IDNO skip_logs
    RMDir /r "$APPDATA\DeskLinkAgent"
  skip_logs:
!macroend

; Prevent multiple instances
!macro customWelcomePage
  !insertmacro MUI_PAGE_WELCOME
!macroend

; Add finish page with proper options
!macro customFinishPage
  !insertmacro MUI_PAGE_FINISH
!macroend
