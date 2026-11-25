using UnityEngine;

/// <summary>
/// Controls player 3D movement, jumping, and collision detection.
/// Uses Rigidbody physics for smooth and responsive platformer controls.
/// </summary>
[RequireComponent(typeof(Rigidbody))]
[RequireComponent(typeof(Collider))]
public class PlayerController : MonoBehaviour
{
    [Header("Movement")]
    [Tooltip("Movement speed in units per second")]
    public float moveSpeed = 7.0f;

    [Tooltip("Turning speed toward movement direction")]
    public float rotationSpeed = 12.0f;

    [Tooltip("Upward impulse force applied when jumping")]
    public float jumpForce = 7.0f;

    [Header("Ground Detection")]
    [Tooltip("Distance beneath player to check for solid ground")]
    public float groundCheckDistance = 1.15f;
    public LayerMask groundLayer = ~0; // All layers by default

    [Header("Respawn")]
    [Tooltip("Y coordinate below which the player respawns at the start")]
    public float fallThreshold = -8.0f;

    private Rigidbody rb;
    private Vector3 spawnPosition;
    private bool isGrounded;
    private float horizontalInput;
    private float verticalInput;
    private bool jumpRequested;

    private void Awake()
    {
        rb = GetComponent<Rigidbody>();
        // Freeze X and Z rotations to keep player upright
        rb.freezeRotation = true;
        rb.collisionDetectionMode = CollisionDetectionMode.ContinuousDynamic;
        spawnPosition = transform.position;
    }

    private void Update()
    {
        // Read WASD and Arrow keys
        horizontalInput = Input.GetAxisRaw("Horizontal");
        verticalInput = Input.GetAxisRaw("Vertical");

        // Raycast down from center to check if standing on a platform
        isGrounded = Physics.Raycast(transform.position, Vector3.down, groundCheckDistance, groundLayer);

        // Jump when Space is pressed and player is on the ground
        if (Input.GetKeyDown(KeyCode.Space) && isGrounded)
        {
            jumpRequested = true;
        }

        // Respawn if player falls into the abyss
        if (transform.position.y < fallThreshold)
        {
            Respawn();
        }
    }

    private void FixedUpdate()
    {
        // Calculate move vector relative to world axes
        Vector3 moveDirection = new Vector3(horizontalInput, 0f, verticalInput).normalized;

#if UNITY_6000_0_OR_NEWER
        Vector3 currentVel = rb.linearVelocity;
#else
        Vector3 currentVel = rb.velocity;
#endif

        if (moveDirection.magnitude >= 0.1f)
        {
            // Apply horizontal velocity while preserving vertical gravity velocity
            Vector3 targetVel = moveDirection * moveSpeed;
            targetVel.y = currentVel.y;

#if UNITY_6000_0_OR_NEWER
            rb.linearVelocity = targetVel;
#else
            rb.velocity = targetVel;
#endif

            // Smoothly rotate toward movement direction
            Quaternion targetRot = Quaternion.LookRotation(moveDirection);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRot, rotationSpeed * Time.fixedDeltaTime);
        }
        else
        {
            // Dampen horizontal sliding when no key is held
            currentVel.x *= 0.8f;
            currentVel.z *= 0.8f;

#if UNITY_6000_0_OR_NEWER
            rb.linearVelocity = currentVel;
#else
            rb.velocity = currentVel;
#endif
        }

        // Apply jump velocity
        if (jumpRequested)
        {
#if UNITY_6000_0_OR_NEWER
            Vector3 jv = rb.linearVelocity;
            jv.y = jumpForce;
            rb.linearVelocity = jv;
#else
            Vector3 jv = rb.velocity;
            jv.y = jumpForce;
            rb.velocity = jv;
#endif
            jumpRequested = false;
        }
    }

    /// <summary>
    /// Resets the player back to the starting checkpoint with zero velocity.
    /// </summary>
    public void Respawn()
    {
        transform.position = spawnPosition;
#if UNITY_6000_0_OR_NEWER
        rb.linearVelocity = Vector3.zero;
#else
        rb.velocity = Vector3.zero;
#endif
        rb.angularVelocity = Vector3.zero;
    }

    private void OnTriggerEnter(Collider other)
    {
        // Detect reaching the treasure chest
        if (other.gameObject.name.Contains("Treasure") || other.CompareTag("Treasure"))
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.WinGame();
            }
        }
    }
}
