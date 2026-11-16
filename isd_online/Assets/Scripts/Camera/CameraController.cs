using System;
using UnityEngine;
using UnityEngine.XR;

namespace ISDOnline.Financial
{
    /// <summary>
    /// Multi-platform camera navigation controller.
    /// Supports:
    /// - Desktop WASD and Arrow key navigation
    /// - Right-click mouse freelook (pitch & yaw)
    /// - Mobile touch drag freelook & two-finger zoom
    /// - Mobile device gyroscope head tracking
    /// - Desktop side-by-side stereo preview toggle (press 'V')
    /// - Automatic fallback when XR headsets are not connected
    /// </summary>
    public class CameraController : MonoBehaviour
    {
        [Header("Desktop Navigation")]
        [SerializeField] private float moveSpeed = 5.0f;
        [SerializeField] private float sprintMultiplier = 2.0f;
        [SerializeField] private float mouseSensitivity = 2.5f;
        [SerializeField] private bool invertMouseY = false;

        [Header("Height Boundaries")]
        [SerializeField] private float minHeight = 0.5f;
        [SerializeField] private float maxHeight = 8.0f;

        [Header("Mobile Gyroscope")]
        [SerializeField] private bool enableGyroscope = true;
        [SerializeField] private float gyroSmoothing = 0.1f;

        [Header("Desktop Stereo Preview (Cardboard Emulation)")]
        [Tooltip("Press 'V' to toggle side-by-side stereo view preview on desktop.")]
        [SerializeField] private bool desktopStereoPreview = false;
        [SerializeField] private float interPupillaryDistance = 0.064f; // 64mm standard IPD

        private Camera mainCamera;
        private Camera rightEyeCamera;
        private float yaw = 0f;
        private float pitch = 15f;
        private bool isRightClickHeld = false;
        private bool hasGyroscope = false;
        private Quaternion gyroInitialOffset;

        // Mobile touch tracking
        private Vector2 lastTouchPosition;
        private bool isTouching = false;

        private void Awake()
        {
            mainCamera = GetComponent<Camera>();
            if (mainCamera == null)
            {
                mainCamera = GetComponentInChildren<Camera>();
            }

            Vector3 currentEuler = transform.eulerAngles;
            yaw = currentEuler.y;
            pitch = currentEuler.x;

            InitializeGyroscope();
        }

        private void Start()
        {
            SetupStereoCameras();
        }

        private void InitializeGyroscope()
        {
            hasGyroscope = SystemInfo.supportsGyroscope && enableGyroscope;
            if (hasGyroscope)
            {
                Input.gyro.enabled = true;
                gyroInitialOffset = Quaternion.Euler(90f, 90f, 0f);
                Debug.Log("[CameraController] Hardware Gyroscope enabled for mobile head tracking.");
            }
        }

        private void Update()
        {
            // Toggle stereo preview on desktop with 'V'
            if (Input.GetKeyDown(KeyCode.V))
            {
                desktopStereoPreview = !desktopStereoPreview;
                UpdateStereoCameras();
                Debug.Log($"[CameraController] Desktop Stereo Preview: {(desktopStereoPreview ? "ENABLED (Split-Screen)" : "DISABLED (Mono)")}");
            }

            // If an actual XR HMD is actively tracking, skip mouse/gyro rotation override
            if (XRSettings.isDeviceActive)
            {
                HandleXRLocomotion();
                return;
            }

            // 1. Desktop Keyboard Translation
            HandleDesktopMovement();

            // 2. Desktop Mouse freelook (Right-click drag)
            HandleDesktopMouseLook();

            // 3. Mobile Touch navigation
            HandleMobileTouch();

            // 4. Mobile Gyroscope rotation
            if (hasGyroscope && !isRightClickHeld && !isTouching)
            {
                HandleGyroscopeLook();
            }
        }

        private void HandleDesktopMovement()
        {
            float speed = moveSpeed * (Input.GetKey(KeyCode.LeftShift) ? sprintMultiplier : 1.0f);

            // WASD and Arrow key support
            float horizontal = Input.GetAxis("Horizontal"); // A/D or Left/Right
            float vertical = Input.GetAxis("Vertical");     // W/S or Up/Down

            // Elevation with Q (down) and E (up)
            float elevation = 0f;
            if (Input.GetKey(KeyCode.E) || Input.GetKey(KeyCode.Space)) elevation += 1f;
            if (Input.GetKey(KeyCode.Q) || Input.GetKey(KeyCode.LeftControl)) elevation -= 1f;

            Vector3 moveDirection = (transform.forward * vertical + transform.right * horizontal).normalized;
            moveDirection.y = 0f; // Keep movement parallel to floor plane

            Vector3 translation = (moveDirection * speed + Vector3.up * (elevation * speed)) * Time.deltaTime;
            transform.position += translation;

            // Clamp vertical position within reasonable room bounds
            Vector3 pos = transform.position;
            pos.y = Mathf.Clamp(pos.y, minHeight, maxHeight);
            transform.position = pos;
        }

        private void HandleDesktopMouseLook()
        {
            if (Input.GetMouseButtonDown(1))
            {
                isRightClickHeld = true;
                Cursor.lockState = CursorLockMode.None;
            }
            else if (Input.GetMouseButtonUp(1))
            {
                isRightClickHeld = false;
            }

            if (isRightClickHeld)
            {
                float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity;
                float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity * (invertMouseY ? 1f : -1f);

                yaw += mouseX;
                pitch = Mathf.Clamp(pitch - mouseY, -80f, 85f);

                transform.rotation = Quaternion.Euler(pitch, yaw, 0f);
            }
        }

        private void HandleMobileTouch()
        {
            if (Input.touchCount == 1)
            {
                Touch touch = Input.GetTouch(0);
                if (touch.phase == TouchPhase.Began)
                {
                    isTouching = true;
                    lastTouchPosition = touch.position;
                }
                else if (touch.phase == TouchPhase.Moved && isTouching)
                {
                    Vector2 delta = touch.position - lastTouchPosition;
                    lastTouchPosition = touch.position;

                    yaw += delta.x * 0.15f;
                    pitch = Mathf.Clamp(pitch - delta.y * 0.15f, -80f, 85f);
                    transform.rotation = Quaternion.Euler(pitch, yaw, 0f);
                }
                else if (touch.phase == TouchPhase.Ended || touch.phase == TouchPhase.Canceled)
                {
                    isTouching = false;
                }
            }
            else if (Input.touchCount == 2)
            {
                // Pinch to zoom / translate forward-backward
                Touch t0 = Input.GetTouch(0);
                Touch t1 = Input.GetTouch(1);

                Vector2 prevPos0 = t0.position - t0.deltaPosition;
                Vector2 prevPos1 = t1.position - t1.deltaPosition;

                float prevDist = (prevPos0 - prevPos1).magnitude;
                float currDist = (t0.position - t1.position).magnitude;

                float deltaDist = (currDist - prevDist) * 0.01f;
                transform.position += transform.forward * deltaDist;
            }
        }

        private void HandleGyroscopeLook()
        {
            Quaternion gyroAttitude = Input.gyro.attitude;
            // Coordinate conversion for Unity camera orientation
            Quaternion converted = new Quaternion(gyroAttitude.x, gyroAttitude.y, -gyroAttitude.z, -gyroAttitude.w);
            Quaternion targetRot = gyroInitialOffset * converted;
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRot, gyroSmoothing);
        }

        private void HandleXRLocomotion()
        {
            // For active XR headsets, smooth translation using joystick input
            float h = Input.GetAxis("Horizontal");
            float v = Input.GetAxis("Vertical");
            if (Mathf.Abs(h) > 0.05f || Mathf.Abs(v) > 0.05f)
            {
                Vector3 move = (transform.forward * v + transform.right * h).normalized;
                move.y = 0f;
                transform.position += move * moveSpeed * Time.deltaTime;
            }
        }

        #region Desktop Stereo Preview (Cardboard Split-Screen)

        private void SetupStereoCameras()
        {
            if (mainCamera == null) return;

            // Create secondary camera for right eye
            GameObject rightCamObj = new GameObject("StereoRightEyeCamera");
            rightCamObj.transform.SetParent(this.transform, false);
            rightEyeCamera = rightCamObj.AddComponent<Camera>();
            rightEyeCamera.CopyFrom(mainCamera);
            rightEyeCamera.transform.localPosition = new Vector3(interPupillaryDistance, 0f, 0f);

            // Remove audio listener from right eye to prevent duplicate listener warning
            AudioListener extraListener = rightCamObj.GetComponent<AudioListener>();
            if (extraListener != null) Destroy(extraListener);

            UpdateStereoCameras();
        }

        private void UpdateStereoCameras()
        {
            if (mainCamera == null || rightEyeCamera == null) return;

            if (desktopStereoPreview)
            {
                // Configure Left Eye: left half of screen
                mainCamera.rect = new Rect(0f, 0f, 0.5f, 1f);
                mainCamera.transform.localPosition = new Vector3(-interPupillaryDistance / 2f, 0f, 0f);

                // Configure Right Eye: right half of screen
                rightEyeCamera.rect = new Rect(0.5f, 0f, 0.5f, 1f);
                rightEyeCamera.transform.localPosition = new Vector3(interPupillaryDistance / 2f, 0f, 0f);
                rightEyeCamera.gameObject.SetActive(true);
            }
            else
            {
                // Full mono viewport
                mainCamera.rect = new Rect(0f, 0f, 1f, 1f);
                mainCamera.transform.localPosition = Vector3.zero;
                rightEyeCamera.gameObject.SetActive(false);
            }
        }

        #endregion
    }
}
