"""
Dataset Generator for Fake Account Detection
Creates a realistic synthetic dataset with features commonly used in fake account detection
"""

import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

def generate_fake_account_dataset(n_samples=10000):
    """
    Generate a synthetic dataset for fake account detection
    
    Features:
    - username_length: Length of username
    - num_posts: Number of posts made by the account
    - num_followers: Number of followers
    - num_following: Number of accounts being followed
    - account_age_days: Age of account in days
    - has_profile_picture: Boolean (0/1) for profile picture presence
    - has_bio: Boolean (0/1) for bio presence
    - engagement_ratio: Posts to followers ratio
    - is_verified: Boolean (0/1) for verification status
    - is_fake: Target variable (0=real, 1=fake)
    """
    
    np.random.seed(42)  # For reproducible results
    random.seed(42)
    
    data = []
    
    for i in range(n_samples):
        # Decide if account is fake (30% fake accounts)
        is_fake = np.random.choice([0, 1], p=[0.7, 0.3])
        
        if is_fake == 1:  # Fake account characteristics
            # Fake accounts tend to have specific patterns
            username_length = np.random.choice(
                [np.random.randint(3, 8), np.random.randint(15, 30)], 
                p=[0.3, 0.7]  # Many fake accounts have very long or very short usernames
            )
            
            # Fake accounts often have low post counts
            num_posts = np.random.choice(
                [np.random.randint(0, 10), np.random.randint(10, 50)],
                p=[0.8, 0.2]
            )
            
            # Fake accounts often have suspicious follower patterns
            num_followers = np.random.choice(
                [np.random.randint(0, 100), np.random.randint(1000, 10000)],
                p=[0.6, 0.4]  # Either very few or suspiciously many followers
            )
            
            # Fake accounts often follow many accounts
            num_following = np.random.randint(100, 5000)
            
            # Fake accounts are usually newer
            account_age_days = np.random.choice(
                [np.random.randint(1, 30), np.random.randint(30, 365)],
                p=[0.7, 0.3]
            )
            
            # Fake accounts less likely to have profile pictures and bios
            has_profile_picture = np.random.choice([0, 1], p=[0.6, 0.4])
            has_bio = np.random.choice([0, 1], p=[0.7, 0.3])
            
            # Fake accounts rarely verified
            is_verified = np.random.choice([0, 1], p=[0.99, 0.01])
            
        else:  # Real account characteristics
            # Real accounts have more natural username lengths
            username_length = np.random.randint(5, 20)
            
            # Real accounts have more varied post counts
            num_posts = np.random.choice(
                [np.random.randint(0, 100), np.random.randint(100, 2000)],
                p=[0.4, 0.6]
            )
            
            # Real accounts have more natural follower counts
            num_followers = np.random.choice([
                np.random.randint(10, 500),      # Normal users
                np.random.randint(500, 5000),    # Popular users
                np.random.randint(5000, 50000)   # Very popular users
            ], p=[0.7, 0.25, 0.05])
            
            # Real accounts follow reasonable numbers of people
            num_following = np.random.randint(50, 1000)
            
            # Real accounts can be any age
            account_age_days = np.random.randint(30, 3650)  # Up to 10 years
            
            # Real accounts more likely to have complete profiles
            has_profile_picture = np.random.choice([0, 1], p=[0.2, 0.8])
            has_bio = np.random.choice([0, 1], p=[0.3, 0.7])
            
            # Real accounts can be verified (small chance)
            is_verified = np.random.choice([0, 1], p=[0.95, 0.05])
        
        # Calculate engagement ratio (posts per follower)
        if num_followers == 0:
            engagement_ratio = num_posts  # If no followers, ratio is just post count
        else:
            engagement_ratio = num_posts / num_followers
        
        # Add some noise to make data more realistic
        engagement_ratio += np.random.normal(0, 0.01)
        engagement_ratio = max(0, engagement_ratio)  # Ensure non-negative
        
        data.append({
            'username_length': username_length,
            'num_posts': num_posts,
            'num_followers': num_followers,
            'num_following': num_following,
            'account_age_days': account_age_days,
            'has_profile_picture': has_profile_picture,
            'has_bio': has_bio,
            'engagement_ratio': round(engagement_ratio, 4),
            'is_verified': is_verified,
            'is_fake': is_fake
        })
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Add some additional realistic variations
    # Some real accounts might have characteristics similar to fake ones
    noise_indices = np.random.choice(df[df['is_fake'] == 0].index, size=int(0.1 * len(df[df['is_fake'] == 0])))
    for idx in noise_indices:
        if np.random.random() < 0.5:
            df.loc[idx, 'num_posts'] = np.random.randint(0, 10)  # Real account with few posts
        if np.random.random() < 0.3:
            df.loc[idx, 'has_bio'] = 0  # Real account without bio
    
    return df

def save_dataset(df, filename='fake_accounts_dataset.csv'):
    """Save the dataset to a CSV file"""
    df.to_csv(filename, index=False)
    print(f"Dataset saved to {filename}")
    print(f"Dataset shape: {df.shape}")
    print(f"Fake accounts: {df['is_fake'].sum()} ({df['is_fake'].mean()*100:.1f}%)")
    print(f"Real accounts: {(1-df['is_fake']).sum()} ({(1-df['is_fake']).mean()*100:.1f}%)")

if __name__ == "__main__":
    # Generate dataset
    print("Generating fake account detection dataset...")
    dataset = generate_fake_account_dataset(10000)
    
    # Save dataset
    save_dataset(dataset, 'fake_accounts_dataset.csv')
    
    # Display sample data
    print("\nFirst 10 rows of the dataset:")
    print(dataset.head(10))
    
    print("\nDataset statistics:")
    print(dataset.describe())


