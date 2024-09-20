using System.Security.Claims;
using hackaton_2024.Server.Data.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Controllers;

namespace hackaton_2024.Server.Middleware
{
    public class AuthenticationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceProvider _serviceProvider;
        private readonly IWebHostEnvironment _env;

        public AuthenticationMiddleware(RequestDelegate next, IServiceProvider serviceProvider, IWebHostEnvironment env)
        {
            _next = next;
            _serviceProvider = serviceProvider;
            _env = env;
        }

        public async Task Invoke(HttpContext context)
        {
            var endpoint = context.GetEndpoint();
            if (endpoint?.Metadata?.GetMetadata<ControllerActionDescriptor>() == null && !context.Request.Path.StartsWithSegments("/notificationHub"))
            {
                await _next(context);
                return;
            }

            using var scope = _serviceProvider.CreateScope();
            var userRepository = scope.ServiceProvider.GetService<IUserRepository>();

            if (userRepository == null)
            {
                context.Response.StatusCode = 500;
                return;
            }

            if (_env.IsDevelopment() && context.User.Identity?.IsAuthenticated == false)
            {
                await _next(context);
                return;
            }

            if (context.User.Identity == null || context.User.Identity.Name == null)
            {
                context.Response.StatusCode = 401;
                return;
            }

            var user = await userRepository.GetUserWithEmail(context.User.Identity.Name);

            if (user == null || user.Role == null)
            {
                context.Response.StatusCode = 401;
                return;
            }

            context.User.AddIdentity(new ClaimsIdentity([new Claim(ClaimTypes.Role, user.Role)]));
            context.User.AddIdentity(new ClaimsIdentity([new Claim("UserId", user.UserId.ToString())]));

            await _next(context);
        }
    }
}
